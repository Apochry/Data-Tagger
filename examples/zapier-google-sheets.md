# Example: Google Sheets to Data Tagger to Google Sheets

This example shows how to automatically tag new survey responses added to a Google Sheet.

## Flow
1. New row added to "Survey Responses" sheet
2. Zapier triggers and sends data to Data Tagger API
3. Data Tagger processes with AI
4. Results written back to "Tagged Responses" sheet

## Step-by-Step Setup

### 1. Prepare Your Google Sheets

**Source Sheet: "Survey Responses"**
```
| Response ID | Date       | Customer Comment                | Rating |
|-------------|------------|---------------------------------|--------|
| 1           | 2024-09-15 | Great service! Very helpful.    | 5      |
| 2           | 2024-09-16 | Terrible experience.            | 1      |
```

**Destination Sheet: "Tagged Responses"**
```
| Response ID | Date | Customer Comment | Rating | AI_Tags | Positive | Negative |
|-------------|------|------------------|--------|---------|----------|----------|
```

### 2. Create the Zap

#### Trigger
- **App**: Google Sheets
- **Event**: New Spreadsheet Row
- **Account**: Your Google account
- **Drive**: Select drive
- **Spreadsheet**: "Survey Responses"
- **Worksheet**: Sheet1
- **Trigger Column**: Response ID

#### Action 1: Code by Zapier (Format Data)
- **App**: Code by Zapier
- **Event**: Run JavaScript
- **Input Data**:
  - responseId: (from trigger)
  - date: (from trigger)
  - comment: (from trigger)
  - rating: (from trigger)

- **Code**:
```javascript
// Construct CSV from trigger data
const csvData = `Response ID,Date,Customer Comment,Rating
${inputData.responseId},"${inputData.date}","${inputData.comment}",${inputData.rating}`;

// Define your tags
const tags = [
  {
    name: "Positive",
    description: "Customer expressed satisfaction, happiness, or positive sentiment about service, product, or experience",
    examples: ["Great service", "Very helpful", "Exceeded expectations", "Love it"]
  },
  {
    name: "Negative",
    description: "Customer expressed dissatisfaction, frustration, or negative sentiment",
    examples: ["Terrible experience", "Very disappointed", "Waste of time", "Poor quality"]
  },
  {
    name: "Feature Request",
    description: "Customer suggested a new feature or improvement",
    examples: ["Would be nice if", "Please add", "Could you implement"]
  }
];

// Output for next step
output = {
  csv_data: csvData,
  column: "Customer Comment",
  tags: tags,
  ai_provider: "google",
  ai_model: "gemini-2.0-flash-exp"
};
```

#### Action 2: Webhooks by Zapier (Call API)
- **App**: Webhooks by Zapier
- **Event**: POST
- **URL**: `https://data-tagger.vercel.app/api/tag`
- **Payload Type**: JSON
- **Data**:
  - csv_data: (from Code step output)
  - column: (from Code step output)
  - tags: (from Code step output)
  - ai_provider: (from Code step output)
  - ai_api_key: `{{storage.gemini_key}}` (stored in Zapier Storage)
  - ai_model: (from Code step output)
- **Headers**:
  - Content-Type: `application/json`
- **Wrap Request In Array**: No

**Important formatting tips**
- `csv_data` must include a header row followed by your data row, separated by a newline. Example:
  ```
  Customer Comment
  Great service! Very helpful.
  ```
- `tags` must be a valid JSON array (Zapier will show square brackets). Example:
  ```
  [
    {"name": "Positive", "description": "Positive sentiment"},
    {"name": "Negative", "description": "Negative sentiment"}
  ]
  ```
- If your source value doesn’t already include a newline, add a Formatter → Text → Append step to build `Header\nValue` before the webhook call.

**Note**: No authentication headers needed - this is a public API!

#### Action 3: Formatter by Zapier (Import CSV)
- **App**: Formatter by Zapier
- **Event**: Utilities → Import CSV
- **CSV Input**: `Csv Output` (from Webhooks step)

This converts the API's CSV string into line-item fields (e.g., `Customer Comment`, `AI_Tags`, `Positive`, `Negative`) that map cleanly to Google Sheets.

#### Action 4: Google Sheets (Write Results)
- **App**: Google Sheets
- **Event**: Create Spreadsheet Row(s)
- **Account**: Your Google account
- **Drive**: Select drive
- **Spreadsheet**: "Survey Responses"
- **Worksheet**: "Tagged Responses"
- Map each column to the corresponding line-item output from the Formatter step.

> **Prefer code?** If you’d rather parse the CSV manually, swap the Formatter step for the JavaScript snippet below.

#### Optional: Code by Zapier (Manual CSV Parse)
- **App**: Code by Zapier
- **Event**: Run JavaScript
- **Input Data**:
  - apiResponse: (from Webhooks step)

- **Code**:
```javascript
// Parse the API response
const response = JSON.parse(inputData.apiResponse);
const csvOutput = response.csv_output;

// Parse CSV (simple parsing for this example)
const lines = csvOutput.split('\n');
const headers = lines[0].split(',');
const values = lines[1].split(',');

// Create object from CSV row
const row = {};
headers.forEach((header, i) => {
  row[header] = values[i];
});

// Output parsed data
output = {
  responseId: row['Response ID'],
  date: row['Date'],
  comment: row['Customer Comment'],
  rating: row['Rating'],
  aiTags: row['AI_Tags'],
  positive: row['Positive'],
  negative: row['Negative']
};
```

### 3. Store Your AI API Key in Zapier Storage

Before testing, store your AI provider API key securely:

1. Go to https://zapier.com/app/storage
2. Add new storage item:
   - Key: `gemini_key`, Value: (your Gemini API key from https://aistudio.google.com/app/apikey)
   
**Why use Storage?**
- Keeps your key secure and private
- Easy to update in one place
- Reference it in any Zap as `{{storage.gemini_key}}`
- **Free tier**: Gemini offers a generous free tier for testing!

### 4. Test the Zap

1. Click "Test & Continue" on each step
2. Add a test row to your Google Sheet
3. Check that the Zap runs successfully
4. Verify results appear in "Tagged Responses" sheet

### 5. Turn On the Zap

Once testing is successful, turn on your Zap. It will now automatically tag every new row!

---

## Batch Processing Variation

To process multiple rows at once (more efficient):

### Trigger
- **App**: Schedule by Zapier
- **Event**: Every Day (or Every Hour)

### Action 1: Google Sheets (Get Rows)
- **App**: Google Sheets
- **Event**: Lookup Spreadsheet Rows
- **Filter**: Get rows where "Tagged" column is empty
- **Max Results**: 100

### Action 2: Code by Zapier (Format All Rows)
```javascript
// Convert multiple rows to CSV
const rows = inputData.rows; // Array from Google Sheets

// Build CSV
const headers = Object.keys(rows[0]);
const csvLines = [headers.join(',')];

rows.forEach(row => {
  const values = headers.map(h => {
    const value = row[h];
    // Escape quotes and wrap in quotes if contains comma
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  });
  csvLines.push(values.join(','));
});

output = {
  csv_data: csvLines.join('\n'),
  // ... rest same as before
};
```

### Benefits
- ✅ Fewer Zap runs = lower Zapier costs
- ✅ Process many rows at once
- ✅ Better for scheduled processing

---

## Cost Estimate

**For 1,000 responses per month:**

- Zapier Starter ($19.99): 750 tasks
  - 1 trigger + 4 actions = 5 tasks per response
  - 1000 responses = 5000 tasks
  - Need Professional plan: $49/month

- Google Gemini (gemini-2.0-flash-exp):
  - **FREE** up to 1,500 requests per day
  - 1000 responses: **$0.00** (free tier!)

**Total: ~$49/month for 1,000 responses** (just Zapier, AI is free!)

**With batch processing (100 rows at once):**
- 1000 responses / 100 = 10 Zap runs
- 10 runs × 5 tasks = 50 tasks
- Can use Zapier Free tier!

**Total: ~$0.15/month (just AI costs)** 🎉

---

## Troubleshooting

### CSV contains no data
- Ensure `csv_data` includes a header row and at least one data row separated by a newline (two lines in Zapier’s editor).
- If the field appears on one line, add a Formatter → Text → Append step to create `Header\nValue` before sending to the webhook.
- Confirm the source value doesn’t contain stray carriage returns that break the CSV structure.

### Tags Not Matching Expectations
- Make tag descriptions more specific
- Add more examples
- Try different AI model (GPT-4o is more accurate)

### Zap Running Slowly
- Expected: 2-5 seconds per response
- Use batch processing for better performance
- Choose faster model (gpt-4o-mini)

### Some Rows Have Empty Tags
- Check that comment column isn't empty
- Verify column name matches exactly
- Review AI_Error column if present

---

## Next Steps

- Add conditional logic (if "Negative" tag, send Slack alert)
- Create charts/reports from tagged data
- Export tagged data to other tools (Airtable, Notion, etc.)

---

Made with ❤️ by the Data Tagger community

