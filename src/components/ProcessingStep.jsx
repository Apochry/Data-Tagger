import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function ProcessingStep({
  csvData,
  selectedColumn,
  tags,
  apiKey,
  selectedModel,
  onComplete,
}) {
  const [progress, setProgress] = useState(0)
  const [currentRow, setCurrentRow] = useState(0)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const shouldStopRef = useRef(false)
  const shouldPauseRef = useRef(false)

  useEffect(() => {
    processData()
  }, [])

  const handleStop = () => {
    shouldStopRef.current = true
    setStatus('Stopping...')
    setIsProcessing(false)
  }

  const handlePauseResume = () => {
    shouldPauseRef.current = !shouldPauseRef.current
    setIsPaused(!isPaused)
    if (!isPaused) {
      setStatus('Paused')
    }
  }

  const processData = async () => {
    try {
      console.log('=== STARTING PROCESSING ===')
      console.log('Selected Model:', selectedModel)
      console.log('API Key length:', apiKey?.length || 0)
      console.log('Total rows to process:', csvData.length)
      console.log('Selected column:', selectedColumn)
      console.log('Tags defined:', tags.map(t => t.name).join(', '))
      
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: selectedModel })

      // Create a comprehensive prompt with tag definitions
      const tagDefinitions = tags
        .map((tag, index) => {
          let def = `${index + 1}. "${tag.name}"\n   Description: ${tag.description || 'No description provided'}`
          if (tag.examples && tag.examples.length > 0) {
            def += `\n   Examples: ${tag.examples.map(ex => `"${ex}"`).join(', ')}`
          }
          return def
        })
        .join('\n\n')

      const tagNames = tags.map((t) => t.name)
      console.log('Tag names for validation:', tagNames)

      // Process each row
      const processedData = []
      const totalRows = csvData.length

      for (let i = 0; i < totalRows; i++) {
        // Check if user wants to stop
        if (shouldStopRef.current) {
          setStatus('Processing stopped by user')
          setError('Processing was stopped. Partial data will not be available.')
          return
        }

        // Check if user wants to pause
        while (shouldPauseRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          if (shouldStopRef.current) {
            setStatus('Processing stopped by user')
            setError('Processing was stopped. Partial data will not be available.')
            return
          }
        }

        const row = csvData[i]
        const comment = row[selectedColumn]

        setCurrentRow(i + 1)
        setStatus(`Processing row ${i + 1} of ${totalRows}...`)

        console.log(`\n--- Processing Row ${i + 1}/${totalRows} ---`)
        console.log('Comment:', comment?.substring(0, 100) + (comment?.length > 100 ? '...' : ''))

        if (!comment || comment.trim() === '') {
          console.log('Skipping empty comment')
          // Handle empty comments
          const newRow = { ...row }
          newRow['AI_Tags'] = ''
          tags.forEach((tag) => {
            newRow[`Tag_${tag.name}`] = 0
          })
          processedData.push(newRow)
          setProgress(((i + 1) / totalRows) * 100)
          continue
        }

        try {
          const prompt = `You are a survey response classifier. Your task is to analyze a comment and determine which tags apply.

AVAILABLE TAGS:
${tagDefinitions}

IMPORTANT INSTRUCTIONS:
- Read the comment carefully
- Compare it against each tag's description and examples
- A comment can have MULTIPLE tags, ONE tag, or NO tags
- Return ONLY the tag names that apply, separated by commas
- Tag names must match EXACTLY as listed above
- If no tags apply, return an empty response

COMMENT TO ANALYZE:
"${comment}"

YOUR RESPONSE (comma-separated tag names only):`.trim()

          if (i === 0) {
            // Log the full prompt for the first row to help with debugging
            console.log('Prompt template (first row):', prompt.substring(0, 500) + '...')
          }

          console.log('Sending request to Gemini API...')
          const result = await model.generateContent(prompt)
          const response = await result.response
          const text = response.text().trim()

          console.log('Raw API response:', text)

          // Parse the response - be more flexible with parsing (case-insensitive)
          const parsedTags = text
            .split(',')
            .map((t) => t.trim())
            .map((t) => t.replace(/^["']|["']$/g, '')) // Remove quotes if present
            .filter((t) => t) // Remove empty strings

          console.log('Parsed tags before validation:', parsedTags)

          // Match tags case-insensitively and use the original tag names
          const appliedTags = []
          parsedTags.forEach((parsedTag) => {
            const matchingTag = tagNames.find(
              (tagName) => tagName.toLowerCase() === parsedTag.toLowerCase()
            )
            if (matchingTag && !appliedTags.includes(matchingTag)) {
              appliedTags.push(matchingTag)
            }
          })

          console.log('Valid tags applied:', appliedTags.length > 0 ? appliedTags.join(', ') : 'NONE')
          if (parsedTags.length > appliedTags.length) {
            const unmatched = parsedTags.filter(
              (pt) => !tagNames.find((tn) => tn.toLowerCase() === pt.toLowerCase())
            )
            console.warn('⚠️ Unmatched tags from AI (not in tag list):', unmatched)
          }

          // Create new row with tags
          const newRow = { ...row }
          newRow['AI_Tags'] = appliedTags.join(', ')

          // Add binary columns for each tag
          tags.forEach((tag) => {
            const isApplied = appliedTags.includes(tag.name)
            newRow[`Tag_${tag.name}`] = isApplied ? 1 : 0
            if (isApplied) {
              console.log(`  ✓ Tag applied: ${tag.name}`)
            }
          })

          processedData.push(newRow)
          console.log('Row processed successfully')
        } catch (err) {
          console.error('❌ ERROR processing row:', err)
          console.error('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack?.substring(0, 200)
          })
          // On error, add row with empty tags
          const newRow = { ...row }
          newRow['AI_Tags'] = ''
          newRow['AI_Error'] = err.message
          tags.forEach((tag) => {
            newRow[`Tag_${tag.name}`] = 0
          })
          processedData.push(newRow)
        }

        setProgress(((i + 1) / totalRows) * 100)

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      console.log('\n=== PROCESSING COMPLETE ===')
      console.log('Total rows processed:', processedData.length)
      console.log('Processed data sample:', processedData.slice(0, 2))
      
      setStatus('Processing complete!')
      setIsProcessing(false)
      onComplete(processedData)
    } catch (err) {
      console.error('❌ FATAL PROCESSING ERROR:', err)
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      })
      setError(err.message)
      setStatus('Error occurred during processing')
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Processing Responses
      </h2>
      <p className="text-gray-600 mb-12 font-light">
        The AI is analyzing and tagging your survey data
      </p>

      {/* Progress Circle */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={isPaused ? "#fbbf24" : "#111827"}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <p className="text-lg text-gray-700 font-medium">{status}</p>
        {currentRow > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Row {currentRow} of {csvData.length}
          </p>
        )}

        {/* Control Buttons */}
        {isProcessing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePauseResume}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-sm"
            >
              {isPaused ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </span>
              )}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors rounded-sm"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
                Stop
              </span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Processing Info */}
      <div className="border-t border-gray-200 pt-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{csvData.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Rows</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            <p className="text-sm text-gray-600 mt-1">Tags Defined</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{currentRow}</p>
            <p className="text-sm text-gray-600 mt-1">Rows Processed</p>
          </div>
        </div>
      </div>
    </div>
  )
}