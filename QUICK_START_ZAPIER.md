# Quick Start: Zapier Integration

Get your Data Tagger automation running in **5 minutes**!

## ⚠️ Privacy Notice

When using the Zapier/API integration:
- Your CSV data is processed on **our Vercel servers** (not your computer)
- Your AI provider keys **pass through our servers** during processing
- Processing is **stateless** - nothing is stored or logged
- Data and keys exist only during the request (~1-10 seconds)
- Serverless functions are destroyed after each request

**For maximum privacy**, use the web interface where everything runs in your browser.

---

## Prerequisites (2 minutes)

1. **Get an AI provider API key**
   - **Google AI**: [Free key here](https://aistudio.google.com/app/apikey)
   - **OpenAI**: [Get key here](https://platform.openai.com/api-keys) (requires billing)
   
2. **Create Zapier account** (free)
   - Sign up at [zapier.com](https://zapier.com/sign-up)

## Step 1: Store Your AI Key Securely (1 minute)

1. Go to https://zapier.com/app/storage
2. Click **"+"** to add new storage
3. **Key**: `my_ai_key`
4. **Value**: Paste your AI provider key
5. Click **Save**

✅ Now you can reference it as `{{storage.my_ai_key}}` in any Zap!

## Step 2: Create Your Zap (2 minutes)

### Trigger: Google Sheets
1. Choose **Google Sheets**
2. Event: **New Spreadsheet Row**
3. Select your spreadsheet and worksheet
4. Test to get sample data

### Action 1: Webhooks by Zapier
1. Choose **Webhooks by Zapier**
2. Event: **POST**
3. Configure:

**URL:**
```
https://data-tagger.vercel.app/api/tag
```

**Payload Type:** JSON

**Data:** (Click "Add" for each field)

| Field | Value |
|-------|-------|
| `csv_data` | `ID,Comment\n{{ID}},{{Comment}}` |
| `column` | `Comment` |
| `tags` | See format below |
| `ai_provider` | `google` |
| `ai_api_key` | `{{storage.my_ai_key}}` |
| `ai_model` | `gemini-2.0-flash-exp` |

**Tags format** (paste this in the `tags` field):
```json
[
  {
    "name": "Positive",
    "description": "Customer expressed satisfaction or happiness"
  },
  {
    "name": "Negative",
    "description": "Customer expressed dissatisfaction or frustration"
  }
]
```

**Headers:**
```
Content-Type: application/json
```

4. Click **Test**

### Action 2: Google Sheets (Write Results)
1. Choose **Google Sheets**
2. Event: **Create Spreadsheet Row**
3. Map fields:
   - Use data from the Webhook response
   - Parse `csv_output` field to extract tagged data

## Step 3: Turn On Your Zap! (30 seconds)

1. Review your Zap
2. Click **Turn on Zap**
3. Test with a new row in your spreadsheet
4. Check that tagged data appears! 🎉

---

## Full Request Example

Here's exactly what gets sent to the API:

```json
{
  "csv_data": "ID,Comment\n1,Great service! Very helpful.",
  "column": "Comment",
  "tags": [
    {
      "name": "Positive",
      "description": "Customer expressed satisfaction"
    },
    {
      "name": "Negative",
      "description": "Customer expressed frustration"
    }
  ],
  "ai_provider": "google",
  "ai_api_key": "YOUR_GEMINI_KEY",
  "ai_model": "gemini-2.0-flash-exp"
}
```

**Note**: Google Gemini has a free tier - get your key at https://aistudio.google.com/app/apikey

## What You Get Back

```json
{
  "success": true,
  "rows_processed": 1,
  "csv_output": "ID,Comment,AI_Tags,Positive,Negative\n1,Great service! Very helpful.,Positive,1,0",
  "tags_applied": ["Positive", "Negative"]
}
```

The `csv_output` field contains your original data PLUS:
- `AI_Tags` column: Comma-separated tag names
- Binary columns for each tag (0 or 1)

---

## Common Issues

### ❌ "Validation failed"
- Check all required fields are present
- Verify `tags` is valid JSON array
- Make sure `column` name matches your CSV header

### ❌ "Rate limit exceeded"
- Wait 15 minutes (limit: 10 requests per 15 min)
- For higher limits, contact the developer

### ❌ "Processing failed"
- Check your AI API key is valid
- Verify you have credits with your AI provider
- Try with a smaller dataset first

---

## Tips for Success

✅ **Start small**: Test with 1-2 rows first  
✅ **Clear descriptions**: Better tag descriptions = better accuracy  
✅ **Monitor costs**: Check your AI provider billing dashboard  
✅ **Use examples**: Add example strings to your tag definitions  

---

## Need Help?

- 📚 [Full API Documentation](https://github.com/Apochry/Data-Tagger/blob/main/API_DOCUMENTATION.md)
- ⚡ [Detailed Zapier Guide](https://github.com/Apochry/Data-Tagger/blob/main/ZAPIER_GUIDE.md)
- 🐛 [Report Issues](https://github.com/Apochry/Data-Tagger/issues)

---

**Ready to automate? Let's go!** 🚀

