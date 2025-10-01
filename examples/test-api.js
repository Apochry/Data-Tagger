/**
 * Test script for Data Tagger API
 * 
 * Usage:
 * 1. Set environment variables:
 *    - GEMINI_API_KEY (get free key at https://aistudio.google.com/app/apikey)
 * 2. Run: node examples/test-api.js
 */

const API_URL = 'https://data-tagger.vercel.app/api/tag'
const AI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'

// Get your free Gemini API key at: https://aistudio.google.com/app/apikey

// Sample CSV data
const sampleCSV = `Response ID,Date,Customer Comment,Rating
1,2024-09-15,Great service! The team was very helpful and responsive.,5
2,2024-09-16,Terrible experience. My issue was never resolved.,1
3,2024-09-17,The product works as described but shipping was slow.,3
4,2024-09-18,I love this! Will definitely recommend to friends.,5
5,2024-09-19,Customer support was rude and unhelpful.,1`

// Sample tags
const tags = [
  {
    name: 'Positive',
    description: 'Customer expressed satisfaction, happiness, or positive sentiment',
    examples: ['Great service', 'Very helpful', 'Exceeded expectations', 'Love it']
  },
  {
    name: 'Negative',
    description: 'Customer expressed dissatisfaction, frustration, or negative sentiment',
    examples: ['Terrible experience', 'Very disappointed', 'Waste of time', 'Rude']
  },
  {
    name: 'Product Quality',
    description: 'Comments specifically about product quality or functionality',
    examples: ['Works well', 'Poor quality', 'Product is great', 'Defective']
  },
  {
    name: 'Customer Service',
    description: 'Comments about customer support or service team',
    examples: ['Support was helpful', 'Team responded quickly', 'Rude staff']
  },
  {
    name: 'Shipping',
    description: 'Comments about delivery, shipping speed, or packaging',
    examples: ['Fast delivery', 'Slow shipping', 'Package arrived damaged']
  }
]

async function testAPI() {
  console.log('🚀 Testing Data Tagger API...\n')

  const requestBody = {
    csv_data: sampleCSV,
    column: 'Customer Comment',
    tags: tags,
    ai_provider: 'google',
    ai_api_key: AI_API_KEY,
    ai_model: 'gemini-2.0-flash-exp'
  }

  console.log('📤 Sending request to:', API_URL)
  console.log('📋 Processing', sampleCSV.split('\n').length - 1, 'rows')
  console.log('🏷️  Using', tags.length, 'tags:', tags.map(t => t.name).join(', '))
  console.log('🤖 Using Google Gemini (free tier)')
  console.log('\n⏳ Processing...\n')

  try {
    const startTime = Date.now()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Secret': API_SECRET
      },
      body: JSON.stringify(requestBody)
    })

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', response.status)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return
    }

    const result = await response.json()

    console.log('✅ Success!')
    console.log('⏱️  Processing time:', elapsedTime, 'seconds')
    console.log('📊 Rows processed:', result.rows_processed)
    console.log('\n📄 Tagged CSV Output:\n')
    console.log(result.csv_output)
    console.log('\n🎉 Test completed successfully!')

    // Calculate tag statistics
    const lines = result.csv_output.split('\n')
    const headers = lines[0].split(',')
    const tagColumns = tags.map(t => t.name)
    
    console.log('\n📈 Tag Statistics:')
    tagColumns.forEach(tag => {
      const tagIndex = headers.indexOf(tag)
      if (tagIndex !== -1) {
        const count = lines.slice(1).filter(line => {
          const values = line.split(',')
          return values[tagIndex] === '1'
        }).length
        console.log(`  ${tag}: ${count} rows`)
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error details:', error)
  }
}

// Run the test
testAPI()

