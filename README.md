# AI Tagger

An elegant web application for automatically tagging survey responses using Google's Gemini AI.

## Features

- **Minimalist Design**: Clean, monochrome interface inspired by NYT and art gallery aesthetics
- **Step-by-Step Process**: Intuitive multi-step workflow with visual progress tracking
- **CSV Upload**: Easy drag-and-drop CSV file upload with column selection
- **Flexible Tagging**: Define custom tags with descriptions and examples
- **AI-Powered**: Choose between Gemini Flash 2.5 (fast & cheap) or Pro 2.5 (accurate & slow)
- **Comprehensive Output**: Download enhanced CSV with tag columns and binary indicators

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## How to Use

1. **Upload CSV**: Drag and drop or browse for your survey response CSV file
2. **Select Column**: Choose the column containing comments to tag
3. **Define Tags**: Create your tagging structure with names, descriptions, and examples
4. **Select Model**: Choose your Gemini model and enter your API key
5. **Process**: Watch as the AI tags your responses in real-time
6. **Download**: Export your enhanced CSV with all tags applied

## API Key

You'll need a Google AI API key to use this application. Get one at:
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## Technologies

- React 18
- Vite
- Tailwind CSS
- PapaParse (CSV handling)
- Google Generative AI SDK

## License

MIT
