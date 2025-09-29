import { useState } from 'react'

export default function ModelSelectionStep({ onComplete }) {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  const models = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini Flash 2.5',
      description: 'Fast and cost-effective processing',
      badge: 'Cheap & Quick',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini Pro 2.5',
      description: 'Maximum accuracy for complex tagging',
      badge: 'Accurate & Slow',
    },
  ]

  const handleContinue = () => {
    if (!apiKey.trim()) {
      alert('Please enter your API key')
      return
    }
    if (!selectedModel) {
      alert('Please select a model')
      return
    }
    onComplete(apiKey, selectedModel)
  }

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Select AI Model</h2>
      <p className="text-gray-600 mb-8 font-light">
        Choose your Gemini model and provide authentication
      </p>

      {/* API Key Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Google AI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          Get your API key at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-4">
          Select Model
        </label>
        <div className="grid gap-4">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-6 text-left border rounded-sm transition-all ${
                selectedModel === model.id
                  ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {model.name}
                </h3>
                <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                  {model.badge}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-8 border-t border-gray-200 mt-8">
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Start Processing
        </button>
      </div>
    </div>
  )
}
