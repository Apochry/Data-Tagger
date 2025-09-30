# AI Tagger 🏷️

An elegant, client-side web application for automatically tagging survey responses using AI. Supports multiple AI providers with dynamic model selection and secure, local processing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)

## ✨ Features

- 🎨 **Minimalist Design**: Clean interface with intuitive multi-step workflow
- 🔄 **Multi-Provider Support**: Choose from Google AI (Gemini), OpenAI (GPT), or OpenRouter (100+ models)
- 🔍 **Dynamic Model Discovery**: Automatically fetches latest available models from each provider
- 📊 **CSV Processing**: Drag-and-drop upload with smart column selection
- 🏷️ **Flexible Tagging**: Define custom tags with descriptions and examples
- 💾 **Auto-Save**: Tags automatically saved to browser storage
- 🔐 **Secure**: API keys stored in memory only, never persisted to disk
- 🔄 **Smart Navigation**: Click any completed step to go back and modify
- ⚡ **Rate Limiting**: Automatic retry with exponential backoff
- 📥 **Enhanced Output**: Download CSV with AI tags and binary indicator columns

## 🚀 Quick Start

### Prerequisites

You'll need an API key from at least one provider:
- **Google AI**: [Get key at AI Studio](https://aistudio.google.com/app/apikey) (Free tier available)
- **OpenAI**: [Get key at OpenAI Platform](https://platform.openai.com/api-keys) (Requires billing)
- **OpenRouter**: [Get key at OpenRouter](https://openrouter.ai/keys) (Pay-as-you-go)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-tagger.git
cd ai-tagger

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 📖 How to Use

1. **Upload CSV**: Drag and drop your survey response CSV file
2. **Select Column**: Choose the column containing comments to tag
3. **Define Tags**: Create your tagging structure with:
   - Tag names (e.g., "Positive", "Negative", "Feature Request")
   - Descriptions to guide the AI
   - Optional examples for better accuracy
4. **Select Provider & Model**: 
   - Choose your AI provider
   - Enter your API key (stored in memory only)
   - Select from dynamically loaded models
5. **Process**: Watch real-time progress as AI tags each response
6. **Download**: Export enhanced CSV with:
   - Original data intact
   - `AI_Tags` column with comma-separated tags
   - Binary columns for each tag (0/1)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **CSV Parsing**: PapaParse
- **State Management**: React Context-free (useState + localStorage)

### Security Model

- ✅ **API keys**: Memory-only storage, never persisted
- ✅ **Data privacy**: All processing client-side, no backend
- ✅ **HTTPS**: All API calls encrypted
- ✅ **Header auth**: API keys in headers, not URLs
- ✅ **localStorage**: Only non-sensitive data (tags, CSV structure)

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## 🛠️ Development

### Project Structure

```
ai-tagger/
├── src/
│   ├── components/
│   │   ├── UploadStep.jsx          # CSV upload & column selection
│   │   ├── TagDefinitionStep.jsx   # Tag creation with autosave
│   │   ├── ModelSelectionStep.jsx  # Provider & model selection
│   │   ├── ProcessingStep.jsx      # AI tagging with progress
│   │   ├── CompletionStep.jsx      # Results & download
│   │   └── ProgressStepper.jsx     # Navigation stepper
│   ├── App.jsx                     # Main app & state management
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── SECURITY.md                     # Security documentation
├── CODE_REVIEW.md                  # Code quality analysis
└── README.md                       # This file
```

### Key Features Implementation

**Multi-Provider Support**:
- Each provider has dedicated API call function
- Dynamic model fetching from provider APIs
- Provider-specific error handling

**Autosave**:
- Tags saved to localStorage on every edit
- Smart detection to avoid saving empty templates
- Instant recovery on page refresh

**Rate Limiting**:
- Exponential backoff (1s, 2s, 4s) for rate limit errors
- Graceful degradation with partial results
- User feedback during retries

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Limitations

- Large CSV files (>10,000 rows) may take significant time to process
- Browser may throttle if tab is not active during processing
- API costs can add up with large datasets - check provider pricing
- Some providers (OpenAI) require billing setup even for testing

## 🗺️ Roadmap

- [ ] Add Anthropic Claude support
- [ ] Batch processing with parallel requests
- [ ] Export to Excel (.xlsx) format
- [ ] Tag confidence scores display
- [ ] Processing cost estimation
- [ ] Resume interrupted processing
- [ ] Tag template library
- [ ] Multi-language support

## 💡 Why Use This Tool?

- **No Backend Required**: Runs entirely in your browser
- **Privacy First**: Your data never leaves your machine (except for AI API calls)
- **Cost Effective**: Choose the most affordable provider for your needs
- **Always Up-to-Date**: Automatically discovers new models as providers release them
- **Flexible**: Works with any CSV data and custom tag structure

## 📊 Use Cases

- Survey response classification
- Customer feedback categorization
- Support ticket tagging
- Content moderation
- Sentiment analysis
- Topic extraction
- Intent classification

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- CSV parsing by [PapaParse](https://www.papaparse.com/)
- Supports [Google AI](https://ai.google.dev/), [OpenAI](https://openai.com/), and [OpenRouter](https://openrouter.ai/)

---

**Made with ❤️ by the open source community**
