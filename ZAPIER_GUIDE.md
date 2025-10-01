# Zapier Integration Guide for End Users

This guide shows you how to automate survey response tagging using Zapier. **No technical skills required!**

## 🎯 What You Can Do

- **Google Forms → Auto-tag → Google Sheets**: Tag responses as they come in
- **Typeform → Auto-tag → Airtable**: Classify survey feedback automatically
- **Email → Auto-tag → Slack**: Alert your team about negative feedback
- **Weekly batch processing**: Tag all responses automatically

## 🔐 Is This Safe?

**Yes!** Here's how it works:
- ✅ **Your AI keys stay yours** - We use them only during processing, never store them
- ✅ **Your data stays private** - No databases, nothing is saved
- ✅ **Open source** - Audit the code on GitHub
- ✅ **HTTPS encrypted** - All traffic is secure

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Get Your AI Provider API Key

Choose one provider:
- **Google AI**: [Get key](https://aistudio.google.com/app/apikey) (Free tier)
- **OpenAI**: [Get key](https://platform.openai.com/api-keys) (Paid)
- **OpenRouter**: [Get key](https://openrouter.ai/keys) (Pay-as-you-go)

### Step 2: Create Your Zap

1. Log into Zapier
2. Click "Create Zap"
3. **Trigger**: Choose your data source (e.g., "New Row in Google Sheets")
4. **Action**: Choose "Webhooks by Zapier" → "POST"
5. **Configure** (see detailed example below)

---

## 📋 Example Zap: Google Sheets → Data Tagger → Google Sheets

### Zap Configuration

**Trigger:**
- App: Google Sheets
- Event: New or Updated Spreadsheet Row
- Spreadsheet: Select your survey responses sheet
- Worksheet: Select worksheet
- Trigger Column: Select column that indicates new data

**Action:**
- App: Webhooks by Zapier
- Event: POST
- URL: `https://your-app.vercel.app/api/tag`
- Payload Type: JSON
- Data:
  ```
  csv_data: [Construct CSV from sheet rows - see below]
  column: "Comment"
  tags: [See tags format below]
  ai_provider: "openai"
  ai_api_key: "sk-..." [Store in Zapier Storage]
  ai_model: "gpt-4o-mini"
  ```
- Headers:
  ```
  Content-Type: application/json
  ```
  *(That's it! No authentication needed)*

### Constructing CSV Data

**Option A: Single Row**
If processing one row at a time:
```javascript
// In Zapier Code step (JavaScript)
const csvData = `Response ID,Date,Comment
${inputData.responseId},${inputData.date},${inputData.comment}`;

output = {
  csv_data: csvData,
  column: "Comment",
  tags: [
    {
      name: "Positive",
      description: "Positive feedback or satisfaction expressed"
    },
    {
      name: "Negative", 
      description: "Negative feedback or complaints"
    }
  ],
  ai_provider: "openai",
  ai_api_key: inputData.openaiKey,
  ai_model: "gpt-4o-mini"
};
```

**Option B: Batch Multiple Rows**
If processing multiple rows:
```javascript
// In Zapier Code step (JavaScript)
const rows = inputData.rows; // Array of row objects
const headers = Object.keys(rows[0]).join(',');
const rowStrings = rows.map(row => Object.values(row).join(','));
const csvData = [headers, ...rowStrings].join('\n');

output = {
  csv_data: csvData,
  column: "Comment",
  tags: [...],
  ai_provider: "openai",
  ai_api_key: inputData.openaiKey,
  ai_model: "gpt-4o-mini"
};
```

### Processing the Response

Add another action to handle the API response:

**Action:**
- App: Code by Zapier
- Event: Run JavaScript
- Input Data:
  ```javascript
  const response = JSON.parse(inputData.webhookResponse);
  const csvOutput = response.csv_output;
  
  // Parse CSV to get rows
  const lines = csvOutput.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
  
  output = { rows: rows };
  ```

**Final Action:**
- App: Google Sheets
- Event: Create Spreadsheet Row(s)
- Spreadsheet: Select output sheet
- Worksheet: Select worksheet
- Map fields from parsed CSV data

---

---

## ⚠️ Important: Store Your AI Key Securely in Zapier

Don't hardcode your AI API key in Zapier! Use **Storage by Zapier**:

1. In Zapier, go to https://zapier.com/app/storage
2. Click "+" to create new storage
3. **Key**: `my_ai_api_key`
4. **Value**: (paste your AI provider key)
5. In your Zap, reference it as: `{{storage.my_ai_api_key}}`

This keeps your key secure and lets you update it in one place!

---

## 🔧 Advanced Zap Examples

### Example 1: Auto-Tag New Survey Responses

**Trigger:** New Google Form Response  
**Actions:**
1. Format form response as CSV
2. Call Data Tagger API (use `{{storage.my_ai_api_key}}` for AI key)
3. Parse results
4. Update Google Sheet with tags
5. (Optional) Send Slack notification if "Negative" tag detected

### Example 2: Batch Process Weekly Survey Data

**Trigger:** Schedule (Every Monday 9am)  
**Actions:**
1. Get last week's rows from Google Sheets
2. Combine into CSV
3. Call Data Tagger API with all rows
4. Parse results
5. Update original sheet with tags
6. Send summary email to team

### Example 3: Real-time Customer Feedback Routing

**Trigger:** New Typeform Response  
**Actions:**
1. Call Data Tagger API with single response
2. Check returned tags
3. **Filter:** If "Urgent" or "Negative" tag
4. Create ticket in Zendesk
5. Send Slack alert to support team
6. **Otherwise:** Just log to database

---

## 📝 Tag Definition Examples

### Customer Support Survey
```json
{
  "tags": [
    {
      "name": "Positive",
      "description": "Customer expressed satisfaction, happiness, or positive sentiment",
      "examples": ["Great service", "Very helpful", "Exceeded expectations"]
    },
    {
      "name": "Negative",
      "description": "Customer expressed dissatisfaction, frustration, or negative sentiment",
      "examples": ["Terrible experience", "Very disappointed", "Waste of time"]
    },
    {
      "name": "Feature Request",
      "description": "Customer suggested a new feature or improvement",
      "examples": ["Would be nice if", "Please add", "Consider adding"]
    },
    {
      "name": "Bug Report",
      "description": "Customer reported a technical issue or bug",
      "examples": ["Not working", "Error message", "Broken feature"]
    },
    {
      "name": "Urgent",
      "description": "Response indicates urgent issue requiring immediate attention",
      "examples": ["ASAP", "Critical", "Emergency", "Immediately"]
    }
  ]
}
```

### Product Feedback Survey
```json
{
  "tags": [
    {
      "name": "Usability Issue",
      "description": "User found something confusing or difficult to use"
    },
    {
      "name": "Performance",
      "description": "Mentions speed, loading time, or performance"
    },
    {
      "name": "Pricing Concern",
      "description": "Mentions cost, price, or value for money"
    },
    {
      "name": "Would Recommend",
      "description": "User indicates they would recommend to others"
    }
  ]
}
```

---

## 🔐 Security Best Practices

### 1. Store Your AI Keys Securely
- ✅ Use Zapier Storage (see above)
- ❌ Never hardcode API keys in Zap fields
- ✅ Rotate keys periodically

### 2. Use Least Privilege
- Give Zapier only the permissions it needs
- Use read-only access where possible
- Create separate API keys for Zapier

### 3. Monitor Usage
- Check Zapier Task History regularly
- Monitor AI provider billing
- Set up usage alerts

### 4. Handle Failures Gracefully
- Add error paths in Zaps
- Set up notifications for failed Zaps
- Implement retry logic with delays

---

## 💰 Cost Estimate

### What You'll Pay

**Data Tagger API:**
- **$0** - It's free!

**Zapier:**
- Free: 100 tasks/month (great for testing!)
- Starter: $19.99/month for 750 tasks
- Professional: $49/month for 2,000 tasks

**AI Provider (example with OpenAI GPT-4o-mini):**
- ~$0.00015 per response tagged
- 100 responses: ~$0.015 (less than 2 cents!)
- 1,000 responses: ~$0.15
- 10,000 responses: ~$1.50

**Total for 100 responses/month:**
- Data Tagger: $0
- Zapier: $0 (free tier)
- AI: ~$0.015
- **Total: Less than 2 cents!** 🎉

### Cost Optimization Tips

1. **Use Zapier Filters**: Only tag responses that need it
2. **Choose Cheaper AI Models**: 
   - Google Gemini Flash: Free tier available
   - GPT-4o-mini: Cheapest OpenAI option
3. **Batch Processing**: Process multiple responses at once (fewer Zap runs)
4. **Schedule vs Real-time**: Use scheduled Zaps instead of real-time triggers

---

## 🐛 Troubleshooting

### "Zap Failed: 400 Validation Failed"
✅ Verify CSV data is properly formatted  
✅ Check all required fields are present  
✅ Ensure column name matches CSV header exactly  
✅ Validate tag definitions have required fields

### "Zap Runs but No Tags Applied"
✅ Check AI provider API key is valid  
✅ Verify AI model name is correct  
✅ Check AI provider account has credits  
✅ Review tag descriptions - make them clearer

### "Zap is Slow"
✅ Expected: ~1-3 seconds per row  
✅ Batch rows together when possible  
✅ Use faster AI models (Flash vs Pro)  
✅ Reduce number of tags

---

## 📚 Resources

- **API Documentation**: See API_DOCUMENTATION.md
- **Code Examples**: See `/examples` folder
- **Zapier Documentation**: https://zapier.com/help
- **Community Support**: https://github.com/Apochry/Data-Tagger/discussions

---

## 🎉 Example Zapier Templates

Copy these templates to get started quickly:

1. **[Google Forms to Tagged Google Sheets]**
2. **[Typeform to Airtable with Tags]**
3. **[CSV Email Attachment to Tagged CSV]**
4. **[Slack Command to Tagged Report]**

(Templates coming soon - submit yours as a PR!)

---

## 🤝 Contributing

Have a great Zap template? Share it!
1. Create your Zap
2. Export as template
3. Submit PR with documentation
4. Help others automate!

---

Made with ❤️ by the Data Tagger community

