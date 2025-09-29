import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function ModelSelectionStep({ onComplete }) {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [showOlderModels, setShowOlderModels] = useState(false)

  // Auto-fetch models when API key is entered
  useEffect(() => {
    if (apiKey.trim() && !hasAttemptedLoad) {
      fetchModels()
    }
  }, [apiKey])

  const fetchModels = async () => {
    if (!apiKey.trim()) {
      setModelsError('Please enter an API key first')
      return
    }

    console.log('🔍 Fetching available models from Gemini API...')
    setIsLoadingModels(true)
    setModelsError(null)
    setHasAttemptedLoad(true)

    try {
      // Fetch models from the REST API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const modelList = data.models || []
      
      console.log('📋 Raw models received:', modelList)

      // Filter and format models for display
      const formattedModels = modelList
        .filter(model => {
          // Only show generative models (not embedding, etc.)
          const isGenerative = model.supportedGenerationMethods?.includes('generateContent')
          // Filter to gemini models only
          const isGemini = model.name.toLowerCase().includes('gemini')
          return isGenerative && isGemini
        })
        .map(model => {
          // Extract model ID (remove 'models/' prefix if present)
          const modelId = model.name.replace('models/', '')
          
          // Create friendly display name
          const displayName = modelId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          // Determine badge based on model name
          let badge = 'Standard'
          let description = 'AI model for text generation'
          
          if (modelId.includes('flash')) {
            badge = 'Fast & Affordable'
            description = 'Optimized for speed and cost-effectiveness'
          } else if (modelId.includes('pro')) {
            badge = 'High Accuracy'
            description = 'Maximum accuracy for complex tasks'
          } else if (modelId.includes('nano')) {
            badge = 'Lightweight'
            description = 'Compact model for basic tasks'
          }

          return {
            id: modelId,
            name: displayName,
            description: description,
            badge: badge,
            rawModel: model
          }
        })
        .sort((a, b) => {
          // Sort: Pro models first, then Flash, then others
          const order = { pro: 1, flash: 2, nano: 3 }
          const aType = a.id.includes('pro') ? 'pro' : a.id.includes('flash') ? 'flash' : 'nano'
          const bType = b.id.includes('pro') ? 'pro' : b.id.includes('flash') ? 'flash' : 'nano'
          return (order[aType] || 99) - (order[bType] || 99)
        })

      console.log('✅ Formatted models:', formattedModels.map(m => m.id))
      
      if (formattedModels.length === 0) {
        setModelsError('No compatible Gemini models found. Please check your API key.')
      } else {
        setModels(formattedModels)
      }
      
      setIsLoadingModels(false)
    } catch (error) {
      console.error('❌ Error fetching models:', error)
      setModelsError(`Failed to load models: ${error.message}`)
      setIsLoadingModels(false)
      
      // Fallback to default models
      console.log('⚠️ Using fallback default models')
      setModels([
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: 'Fast and cost-effective processing',
          badge: 'Fast & Affordable',
        },
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Maximum accuracy for complex tagging',
          badge: 'High Accuracy',
        },
      ])
    }
  }

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
        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              setHasAttemptedLoad(false) // Allow retry with new key
            }}
            placeholder="Enter your Gemini API key"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
          <button
            onClick={fetchModels}
            disabled={!apiKey.trim() || isLoadingModels}
            className="px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed rounded-sm"
          >
            {isLoadingModels ? 'Loading...' : 'Load Models'}
          </button>
        </div>
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

        {/* Loading State */}
        {isLoadingModels && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading available models...</p>
          </div>
        )}

        {/* Error State */}
        {modelsError && !isLoadingModels && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm mb-4">
            <p className="text-yellow-800 font-medium">⚠️ {modelsError}</p>
            <p className="text-yellow-700 text-sm mt-1">Using default models as fallback.</p>
          </div>
        )}

        {/* Models List */}
        {!isLoadingModels && models.length === 0 && !modelsError && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-sm">
            <p className="text-gray-600">Enter your API key to load available models</p>
          </div>
        )}

        {!isLoadingModels && models.length > 0 && (() => {
          // Split models into latest and older versions
          const latestModels = models.filter(m => m.id.toLowerCase().includes('latest'))
          const olderModels = models.filter(m => !m.id.toLowerCase().includes('latest'))

          const renderModelButton = (model) => (
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
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{model.id}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                  {model.badge}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{model.description}</p>
            </button>
          )

          return (
            <div className="space-y-6">
              {/* Latest Models Section */}
              {latestModels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">LATEST</span>
                    Recommended Models
                  </h3>
                  <div className="grid gap-4">
                    {latestModels.map(renderModelButton)}
                  </div>
                </div>
              )}

              {/* Older Models Section (Accordion) */}
              {olderModels.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowOlderModels(!showOlderModels)}
                    className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Older Models ({olderModels.length})
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        showOlderModels ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showOlderModels && (
                    <div className="grid gap-4 mt-4">
                      {olderModels.map(renderModelButton)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}
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
