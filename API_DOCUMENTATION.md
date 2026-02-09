# Data Tagger API Documentation

The Data Tagger API is a **token-protected** endpoint that allows you to automate survey response tagging through Zapier, Make, n8n, or any HTTP client.

## 🚀 Quick Start

### Base URL
```
https://data-tagger.com/api/tag
```
*(Replace with the actual deployed URL)*

### Authentication
API token authentication is required in production.

Set a server-side `PUBLIC_API_TOKEN`, then send one of:
- `Authorization: Bearer YOUR_PUBLIC_API_TOKEN`
- `x-api-token: YOUR_PUBLIC_API_TOKEN`

Your AI provider API key is passed in the request body and used only during processing - it's never stored.

### Rate Limits
- **10 requests per 15 minutes** per IP address
- Maximum **10MB** CSV size
- Maximum **10,000 rows** per request

### Security Model
✅ **Zero data storage** - All processing is stateless  
✅ **Pass-through AI keys** - Your keys are never stored  
✅ **HTTPS only** - All traffic encrypted  
✅ **Rate limited** - Prevents abuse

---

## 📋 API Endpoint

### POST /api/tag

Process CSV data with AI tagging.

**Request Headers:**
```
Content-Type: application/json
x-api-token: YOUR_PUBLIC_API_TOKEN
```

**Request Body:**
```json
{
  "csv_data": "Response ID,Date,Comment\n1,2024-09-15,Great service!",
  "column": "Comment",
  "tags": [
    {
      "name": "Positive",
      "description": "Positive feedback or satisfaction",
      "examples": ["Great!", "Love it"]
    },
    {
      "name": "Negative",
      "description": "Negative feedback or complaints",
      "examples": ["Terrible", "Disappointed"]
    }
  ],
  "ai_provider": "google",
  "ai_api_key": "YOUR_GEMINI_KEY",
  "ai_model": "gemini-2.0-flash-exp"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `csv_data` | string | Yes | CSV data as a string (with headers) |
| `column` | string | Yes | Name of column containing text to tag |
| `tags` | array | Yes | Array of tag definitions |
| `tags[].name` | string | Yes | Tag name (max 100 chars) |
| `tags[].description` | string | Yes | Description of when to apply tag (max 500 chars) |
| `tags[].examples` | array | No | Array of example strings |
| `ai_provider` | string | Yes | One of: `google`, `openai`, `openrouter` |
| `ai_api_key` | string | Yes | Your AI provider API key (not stored) |
| `ai_model` | string | Yes | Model name (e.g., `gpt-4o-mini`, `gemini-2.0-flash-exp`) |

**Success Response (200):**
```json
{
  "success": true,
  "rows_processed": 100,
  "csv_output": "Response ID,Date,Comment,AI_Tags,Positive,Negative\n1,2024-09-15,Great service!,Positive,1,0",
  "tags_applied": ["Positive", "Negative"]
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "messages": [
    "csv_data is required and must be a string"
  ]
}
```

**Error Response (429):**
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 15 minutes."
}
```

**Error Response (500):**
```json
{
  "error": "Processing failed",
  "message": "An error occurred while processing your request"
}
```

---

## 🎯 Supported AI Providers

### Google AI (Gemini)
- **Provider:** `google`
- **API Key:** Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Models:** `gemini-2.0-flash-exp`, `gemini-1.5-pro-latest`, etc.

### OpenAI (GPT)
- **Provider:** `openai`
- **API Key:** Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Models:** `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, etc.

### OpenRouter
- **Provider:** `openrouter`
- **API Key:** Get from [OpenRouter](https://openrouter.ai/keys)
- **Models:** `anthropic/claude-3.5-sonnet`, `google/gemini-pro`, etc.

---

## 🔐 Security & Privacy

### How It Works
1. You send a request with your CSV data and **your own AI provider API key**
2. Our **Vercel serverless function** receives your request
3. The function processes your data in memory using your AI key
4. Your AI key and data are **immediately discarded** after processing
5. Tagged data is returned to you
6. **Nothing is stored** - the serverless container is destroyed

### Where Processing Happens
⚠️ **Important**: When using the API, your data is processed on **our Vercel servers** (not your computer). While we don't store anything, your CSV data and AI keys do pass through our infrastructure during processing.

For maximum privacy, use the **web interface** where all processing happens locally in your browser.

### Your AI Keys Are Safe
- ✅ **Never stored** - Used only during your request
- ✅ **HTTPS encrypted** - All traffic uses TLS 1.3
- ✅ **Open source** - Audit the code yourself on GitHub
- ✅ **Stateless** - No databases, no logging of sensitive data

### Best Practices
1. Store your AI provider keys securely in Zapier Storage (not hardcoded in Zaps)
2. Use the minimum required AI model for your use case (saves costs)
3. Monitor your AI provider usage and set billing alerts
4. Rate limits prevent accidental runaway costs

---

## 📊 Output Format

The API returns a CSV string with:
1. **All original columns** - Preserved as-is
2. **AI_Tags column** - Comma-separated list of applied tags
3. **Binary tag columns** - One column per tag with 1 (applied) or 0 (not applied)
4. **AI_Error column** (if errors occurred) - Error message for failed rows

**Example:**
```csv
Response ID,Date,Comment,AI_Tags,Positive,Negative
1,2024-09-15,Great service!,Positive,1,0
2,2024-09-16,Terrible experience,Negative,0,1
3,2024-09-17,It was okay,,0,0
```

---

## 🛠️ Testing

### cURL Example
```bash
curl -X POST https://data-tagger.com/api/tag \
  -H "Content-Type: application/json" \
  -H "x-api-token: YOUR_PUBLIC_API_TOKEN" \
  -d '{
    "csv_data": "ID,Comment\n1,Great service!\n2,Terrible experience",
    "column": "Comment",
    "tags": [
      {
        "name": "Positive",
        "description": "Positive feedback",
        "examples": ["Great", "Excellent"]
      }
    ],
    "ai_provider": "google",
    "ai_api_key": "YOUR_GEMINI_KEY",
    "ai_model": "gemini-2.0-flash-exp"
  }'
  
# Get free Gemini key at: https://aistudio.google.com/app/apikey
```

### JavaScript Example
```javascript
const response = await fetch('https://data-tagger.com/api/tag', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-token': process.env.PUBLIC_API_TOKEN
  },
  body: JSON.stringify({
    csv_data: "ID,Comment\n1,Great service!",
    column: "Comment",
    tags: [{
      name: "Positive",
      description: "Positive feedback"
    }],
    ai_provider: "google",
    ai_api_key: process.env.GEMINI_API_KEY,
    ai_model: "gemini-2.0-flash-exp"
  })
})

const result = await response.json()
console.log(result.csv_output)
```

### Python Example
```python
import requests

response = requests.post(
    'https://data-tagger.com/api/tag',
    headers={
        'Content-Type': 'application/json',
        'x-api-token': os.environ['PUBLIC_API_TOKEN']
    },
    json={
        'csv_data': 'ID,Comment\n1,Great service!',
        'column': 'Comment',
        'tags': [{
            'name': 'Positive',
            'description': 'Positive feedback'
        }],
        'ai_provider': 'google',
        'ai_api_key': os.environ['GEMINI_API_KEY'],
        'ai_model': 'gemini-2.0-flash-exp'
    }
)

result = response.json()
print(result['csv_output'])
```

---

## 💰 Cost Estimation

API calls consume AI provider credits. Estimate costs:

**Per Row Cost (approximate):**
- Input tokens: ~100-200 tokens (tags + prompt + comment)
- Output tokens: ~10-50 tokens (tag names)
- Total per row: ~150-250 tokens

**Recommended: Google Gemini (FREE):**
- **Free tier**: 15 requests per minute, 1,500 per day
- Cost: $0.00
- 1,000 rows: **FREE** ✨
- 10,000 rows: **FREE** ✨
- [Get free key](https://aistudio.google.com/app/apikey)

**Alternative: OpenAI GPT-4o-mini (Paid):**
- Cost: ~$0.00015 per row
- 1,000 rows: ~$0.15
- 10,000 rows: ~$1.50

**Tips to reduce costs:**
- **Start with Gemini** - generous free tier!
- Keep tag descriptions concise
- Use smaller/faster models
- Batch similar responses together

---

## 🐛 Troubleshooting

### 400 Validation Failed
- Verify all required fields are present
- Check CSV data is properly formatted
- Ensure tag names are under 100 characters
- Ensure descriptions are under 500 characters

### 429 Rate Limited
- Wait 15 minutes before trying again
- Contact support to increase rate limits

### 500 Processing Failed
- Check AI provider API key is valid
- Verify AI model name is correct
- Check AI provider account has sufficient credits
- Ensure CSV format is valid

---

## 📞 Support

For API issues or questions:
- GitHub Issues: https://github.com/Apochry/Data-Tagger/issues
- Documentation: https://github.com/Apochry/Data-Tagger

---

## 📄 License

MIT License - see LICENSE file for details

