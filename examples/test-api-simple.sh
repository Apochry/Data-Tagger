#!/bin/bash

# Simple test script for Data Tagger API
# Get your free Gemini API key at: https://aistudio.google.com/app/apikey
# Replace YOUR_GEMINI_API_KEY with your actual API key

curl -X POST https://data-tagger.vercel.app/api/tag \
  -H "Content-Type: application/json" \
  -d '{
    "csv_data": "ID,Comment\n1,Great service! Very helpful.\n2,Terrible experience. Very disappointed.",
    "column": "Comment",
    "tags": [
      {
        "name": "Positive",
        "description": "Customer expressed satisfaction or positive sentiment"
      },
      {
        "name": "Negative",
        "description": "Customer expressed dissatisfaction or negative sentiment"
      }
    ],
    "ai_provider": "google",
    "ai_api_key": "YOUR_GEMINI_API_KEY",
    "ai_model": "gemini-2.0-flash-exp"
  }'

echo ""
echo "Expected response:"
echo '{'
echo '  "success": true,'
echo '  "rows_processed": 2,'
echo '  "csv_output": "ID,Comment,AI_Tags,Positive,Negative\n1,Great service!...,Positive,1,0\n2,Terrible...,Negative,0,1",'
echo '  "tags_applied": ["Positive", "Negative"]'
echo '}'

