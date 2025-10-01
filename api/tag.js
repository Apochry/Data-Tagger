/**
 * Data Tagger API - Public Endpoint for Automation
 * 
 * POST /api/tag
 * 
 * This is a PUBLIC serverless endpoint for CSV tagging automation.
 * No authentication required - rate limited by IP address.
 * 
 * Security model:
 * - No API keys stored on server
 * - User's AI provider keys are pass-through only
 * - Rate limiting: 10 requests per 15 minutes per IP
 * - All processing is stateless
 * 
 * Designed for: Zapier, Make, n8n, custom scripts, etc.
 */

import Papa from 'papaparse'

// Rate limiting storage (in-memory for simplicity, use Redis for production)
const requestCounts = new Map()

// Rate limiter
function checkRateLimit(identifier) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 10

  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, [])
  }

  const requests = requestCounts.get(identifier)
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < windowMs)
  
  if (recentRequests.length >= maxRequests) {
    return false
  }

  recentRequests.push(now)
  requestCounts.set(identifier, recentRequests)
  return true
}

// Input validation
function validateInputs(body) {
  const errors = []

  if (!body.csv_data || typeof body.csv_data !== 'string') {
    errors.push('csv_data is required and must be a string')
  }

  if (body.csv_data && body.csv_data.length > 10 * 1024 * 1024) {
    errors.push('CSV data too large (max 10MB)')
  }

  if (!body.column || typeof body.column !== 'string') {
    errors.push('column is required and must be a string')
  }

  if (!Array.isArray(body.tags) || body.tags.length === 0) {
    errors.push('tags is required and must be a non-empty array')
  }

  if (body.tags) {
    body.tags.forEach((tag, index) => {
      if (!tag.name || typeof tag.name !== 'string') {
        errors.push(`tags[${index}].name is required`)
      }
      if (tag.name && tag.name.length > 100) {
        errors.push(`tags[${index}].name is too long (max 100 chars)`)
      }
      if (tag.description && tag.description.length > 500) {
        errors.push(`tags[${index}].description is too long (max 500 chars)`)
      }
    })
  }

  if (!body.ai_provider || !['google', 'openai', 'openrouter'].includes(body.ai_provider)) {
    errors.push('ai_provider must be one of: google, openai, openrouter')
  }

  if (!body.ai_api_key || typeof body.ai_api_key !== 'string') {
    errors.push('ai_api_key is required')
  }

  if (!body.ai_model || typeof body.ai_model !== 'string') {
    errors.push('ai_model is required')
  }

  return errors
}

// AI Provider API calls
async function callGoogleAI(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google AI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callOpenAI(apiKey, model, prompt) {
  const url = 'https://api.openai.com/v1/chat/completions'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 100
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callOpenRouter(apiKey, model, prompt) {
  const url = 'https://openrouter.ai/api/v1/chat/completions'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://data-tagger.vercel.app',
      'X-Title': 'Data Tagger API'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 100
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenRouter API error: ${response.status} - ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callAI(provider, apiKey, model, prompt) {
  switch (provider) {
    case 'google':
      return await callGoogleAI(apiKey, model, prompt)
    case 'openai':
      return await callOpenAI(apiKey, model, prompt)
    case 'openrouter':
      return await callOpenRouter(apiKey, model, prompt)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

// Process CSV data with AI tagging
async function processCSVData(csvData, column, tags, provider, apiKey, model) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data
          
          if (data.length === 0) {
            throw new Error('CSV contains no data')
          }

          if (data.length > 10000) {
            throw new Error('CSV contains too many rows (max 10,000)')
          }

          if (!data[0][column]) {
            throw new Error(`Column "${column}" not found in CSV`)
          }

          // Build the prompt
          const tagDescriptions = tags.map(tag => {
            let desc = `- ${tag.name}: ${tag.description || 'No description provided'}`
            if (tag.examples && tag.examples.length > 0) {
              const validExamples = tag.examples.filter(ex => ex && ex.trim())
              if (validExamples.length > 0) {
                desc += `\n  Examples: ${validExamples.join('; ')}`
              }
            }
            return desc
          }).join('\n')

          const processedData = []

          for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const comment = row[column]

            // Handle empty comments
            if (!comment || comment.trim() === '') {
              const newRow = { ...row, AI_Tags: '' }
              tags.forEach(tag => {
                newRow[tag.name] = 0
              })
              processedData.push(newRow)
              continue
            }

            try {
              const prompt = `You are a survey response classifier. Analyze the following response and assign ONLY the relevant tags from the list below. Return ONLY the tag names as a comma-separated list. If no tags apply, return "None".

Available tags:
${tagDescriptions}

Response to classify: "${comment}"

Return only the applicable tag names, comma-separated (or "None"):`

              const aiResponse = await callAI(provider, apiKey, model, prompt)
              
              // Parse AI response
              const responseTags = aiResponse
                .trim()
                .split(',')
                .map(t => t.trim())
                .filter(t => t && t.toLowerCase() !== 'none')

              // Match tags (case-insensitive, exact match)
              const appliedTags = []
              responseTags.forEach(responseTag => {
                const matchedTag = tags.find(t => 
                  t.name.toLowerCase() === responseTag.toLowerCase()
                )
                if (matchedTag) {
                  appliedTags.push(matchedTag.name)
                }
              })

              // Create new row with tags
              const newRow = { ...row }
              newRow.AI_Tags = appliedTags.join(', ')

              // Add binary columns for each tag
              tags.forEach(tag => {
                newRow[tag.name] = appliedTags.includes(tag.name) ? 1 : 0
              })

              processedData.push(newRow)

              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100))

            } catch (err) {
              // On error, add row with empty tags
              const newRow = { ...row, AI_Tags: '', AI_Error: err.message }
              tags.forEach(tag => {
                newRow[tag.name] = 0
              })
              processedData.push(newRow)
            }
          }

          resolve(processedData)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`))
      }
    })
  })
}

// Main handler
export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // CORS - allow anyone to use the API (public endpoint)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted' 
    })
  }

  try {
    // 1. Rate limiting (primary defense for public API)
    const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    if (!checkRateLimit(identifier)) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again in 15 minutes.' 
      })
    }

    // 3. Validate inputs
    const validationErrors = validateInputs(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        messages: validationErrors 
      })
    }

    const { csv_data, column, tags, ai_provider, ai_api_key, ai_model } = req.body

    // 3. Process data
    console.log(`Processing ${csv_data.split('\n').length} rows with ${tags.length} tags using ${ai_provider}/${ai_model}`)
    
    const processedData = await processCSVData(
      csv_data,
      column,
      tags,
      ai_provider,
      ai_api_key,
      ai_model
    )

    // 4. Convert back to CSV
    const outputCSV = Papa.unparse(processedData)

    // 5. Return result
    return res.status(200).json({
      success: true,
      rows_processed: processedData.length,
      csv_output: outputCSV,
      tags_applied: tags.map(t => t.name)
    })

  } catch (error) {
    console.error('Processing error:', error.message)
    
    // Don't expose internal details in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ 
        error: 'Processing failed',
        message: 'An error occurred while processing your request'
      })
    } else {
      return res.status(500).json({ 
        error: 'Processing failed',
        message: error.message,
        stack: error.stack
      })
    }
  }
}

