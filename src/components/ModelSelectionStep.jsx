import { useState, useEffect, useCallback } from 'react'

export default function ModelSelectionStep({ onComplete, csvData, selectedColumn, tags }) {
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [showOlderModels, setShowOlderModels] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const providers = [
    {
      id: 'google',
      name: 'Google AI',
      description: 'Models available directly through Google AI',
      apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to 100+ models from multiple providers',
      apiKeyUrl: 'https://openrouter.ai/keys',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Models available directly through OpenAI',
      apiKeyUrl: 'https://platform.openai.com/api-keys',
    },
  ]

  // Estimate token count (rough approximation: 1 token ~= 4 characters for English)
  const estimateTokens = (text) => {
    return Math.ceil(text.length / 4)
  }

  const fetchModels = useCallback(async () => {
    if (!apiKey.trim()) {
      setModelsError('Please enter an API key first')
      return
    }

    console.log(`[models] Fetching available models from ${provider}...`)
    setIsLoadingModels(true)
    setModelsError(null)
    setHasAttemptedLoad(true)

    try {
      let modelList = []

      switch (provider) {
        case 'google':
          modelList = await fetchGoogleModels()
          break
        case 'openrouter':
          modelList = await fetchOpenRouterModels()
          break
        case 'openai':
          modelList = await fetchOpenAIModels()
          break
        default:
          throw new Error('Unknown provider')
      }

      console.log('[models] Formatted models:', modelList.map(m => m.id))
      
      if (modelList.length === 0) {
        setModelsError('No compatible models found. Please check your API key.')
      } else {
        setModels(modelList)
      }
      
      setIsLoadingModels(false)
    } catch (error) {
      console.error('[error] Error fetching models:', error)
      setModelsError(`Failed to load models: ${error.message}`)
      setIsLoadingModels(false)
      setModels([])
    }
  }, [apiKey, provider])

  // Auto-fetch models when API key is entered (but not for OpenRouter due to size)
  useEffect(() => {
    if (apiKey.trim() && provider && provider !== 'openrouter' && !hasAttemptedLoad) {
      fetchModels()
    }
  }, [apiKey, provider, hasAttemptedLoad, fetchModels])

  // Reset when provider changes
  useEffect(() => {
    if (provider) {
      setApiKey('')
      setSelectedModel('')
      setModels([])
      setModelsError(null)
      setHasAttemptedLoad(false)
      setSearchQuery('')
    }
  }, [provider])

  const fetchGoogleModels = async () => {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        headers: {
          'x-goog-api-key': apiKey,
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const modelList = data.models || []
    
    console.log('[models] Raw models received:', modelList)

    return modelList
      .filter(model => {
        const isGenerative = model.supportedGenerationMethods?.includes('generateContent')
        const isGemini = model.name.toLowerCase().includes('gemini')
        return isGenerative && isGemini
      })
      .map(model => {
        const modelId = model.name.replace('models/', '')
        const displayName = modelId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        let badge = ''
        let description = 'AI model for text generation'
        
        if (modelId.includes('flash')) {
          badge = 'Fast & Affordable'
          description = 'Optimized for speed and cost-effectiveness'
        } else if (modelId.includes('pro')) {
          badge = 'High Accuracy'
          description = 'Maximum accuracy for complex tasks'
        } else {
          badge = 'General Purpose'
          description = 'AI model for text generation'
        }

        return {
          id: modelId,
          name: displayName,
          description: description,
          badge: badge,
        }
      })
      .sort((a, b) => {
        const order = { pro: 1, flash: 2 }
        const aType = a.id.includes('pro') ? 'pro' : a.id.includes('flash') ? 'flash' : 'other'
        const bType = b.id.includes('pro') ? 'pro' : b.id.includes('flash') ? 'flash' : 'other'
        return (order[aType] || 99) - (order[bType] || 99)
      })
  }

  const fetchOpenRouterModels = async () => {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[models] Raw models received:', data.data?.length || 0)
    
    return (data.data || []).map(model => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || 'No description available',
      badge: model.pricing?.prompt ? `$${model.pricing.prompt}/1M tokens` : 'Pricing varies',
      context: model.context_length,
    }))
  }

  const fetchOpenAIModels = async () => {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[models] Raw models received:', data.data?.length || 0)
    
    // Filter to chat/completion models only
    return (data.data || [])
      .filter(model => {
        const id = model.id.toLowerCase()
        return id.includes('gpt') && !id.includes('instruct') && !id.includes('search')
      })
      .map(model => {
        let badge = ''
        let description = 'OpenAI language model'
        
        if (model.id.includes('gpt-4')) {
          badge = 'GPT-4'
          description = 'Most capable GPT-4 model'
        } else if (model.id.includes('gpt-3.5')) {
          badge = 'Fast & Affordable'
          description = 'Quick and cost-effective'
        } else {
          badge = 'General Purpose'
          description = 'OpenAI language model'
        }

        return {
          id: model.id,
          name: model.id.toUpperCase().replace(/-/g, ' '),
          description: description,
          badge: badge,
        }
      })
      .sort((a, b) => b.id.localeCompare(a.id)) // Newest first
  }


  // Calculate token usage estimate
  const calculateTokenEstimate = () => {
    if (!csvData || !tags || tags.length === 0) {
      return null
    }

    console.log('[tokens] Calculating token estimate...')

    const tagDefinitions = tags
      .map((tag, index) => {
        let def = `${index + 1}. "${tag.name}"\n   Description: ${tag.description || 'No description provided'}`
        if (tag.examples && tag.examples.length > 0) {
          def += `\n   Examples: ${tag.examples.map(ex => `"${ex}"`).join(', ')}`
        }
        return def
      })
      .join('\n\n')

    const promptTemplate = `You are a survey response classifier. Your task is to analyze a comment and determine which tags apply.

AVAILABLE TAGS:
${tagDefinitions}

IMPORTANT INSTRUCTIONS:
- Read the comment carefully
- Compare it against each tag's description and examples
- A comment can have MULTIPLE tags, ONE tag, or NO tags
- Return ONLY the tag names that apply, separated by commas
- Tag names must match EXACTLY as listed above
- If no tags apply, return an empty response

COMMENT TO ANALYZE:
"PLACEHOLDER_COMMENT"

YOUR RESPONSE (comma-separated tag names only):`

    const promptTokens = estimateTokens(promptTemplate)

    const commentTokenCounts = csvData.map(row => {
      const comment = row[selectedColumn] || ''
      return estimateTokens(comment)
    })
    const totalCommentTokens = commentTokenCounts.reduce((sum, tokens) => sum + tokens, 0)
    const avgCommentTokens = Math.ceil(totalCommentTokens / csvData.length)

    const inputTokensPerRequest = promptTokens + avgCommentTokens

    const maxOutputText = tags.map(t => t.name).join(', ')
    const outputTokensPerRequest = estimateTokens(maxOutputText)

    const totalInputTokens = inputTokensPerRequest * csvData.length
    const totalOutputTokens = outputTokensPerRequest * csvData.length

    console.log('[tokens] Token estimate:', {
      promptTokens,
      avgCommentTokens,
      inputTokensPerRequest,
      outputTokensPerRequest,
      totalInputTokens,
      totalOutputTokens,
      rows: csvData.length
    })

    return {
      totalInputTokens,
      totalOutputTokens,
      inputTokensPerRequest,
      outputTokensPerRequest,
      rows: csvData.length
    }
  }

  const handleContinue = () => {
    if (!provider) {
      alert('Please select a provider')
      return
    }
    if (!apiKey.trim()) {
      alert('Please enter your API key')
      return
    }
    if (!selectedModel) {
      alert('Please select a model')
      return
    }
    onComplete(apiKey, selectedModel, provider)
  }

  // Filter models based on search query (for OpenRouter)
  const filteredModels = searchQuery && provider === 'openrouter'
    ? models.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : models

  // Split models into latest and older (for non-OpenRouter providers)
  const latestModels = provider !== 'openrouter' 
    ? filteredModels.filter(m => m.id.toLowerCase().includes('latest'))
    : []
  const olderModels = provider !== 'openrouter'
    ? filteredModels.filter(m => !m.id.toLowerCase().includes('latest'))
    : []

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
      </div>
      {provider !== 'openrouter' && (
        <p className="text-gray-600 text-sm">{model.description}</p>
      )}
      {model.context && (
        <p className="text-xs text-gray-500 mt-2">Context: {model.context.toLocaleString()} tokens</p>
      )}
    </button>
  )

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Select AI Model</h2>
      <p className="text-gray-600 mb-8 font-light">
        Choose your AI provider and model
      </p>

      {/* Provider Selection */}
      {!provider && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Select Provider
          </label>
          <div className="grid gap-4">
            {providers.map((prov) => (
              <button
                key={prov.id}
                onClick={() => setProvider(prov.id)}
                className="p-6 text-left border border-gray-200 rounded-sm hover:border-gray-400 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {prov.name}
                </h3>
                <p className="text-gray-600 text-sm">{prov.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Key Input and Model Selection */}
      {provider && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setProvider('')}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-sm"
            >
              {'<- Change Provider'}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {providers.find(p => p.id === provider)?.name}
              </p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              API Key
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setHasAttemptedLoad(false)
                }}
                placeholder="Enter your API key"
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
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                Get your API key at{' '}
                <a
                  href={providers.find(p => p.id === provider)?.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-900"
                >
                  {providers.find(p => p.id === provider)?.name}
                </a>
              </p>
              <p className="text-xs text-gray-400 italic">
                Your API key will be kept private and is never stored or saved outside of your machine
              </p>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Select Model
            </label>

            {/* Search Bar (OpenRouter only) */}
            {provider === 'openrouter' && models.length > 0 && (
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models by name or description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    Found {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

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
                <p className="text-yellow-800 font-medium">Warning: {modelsError}</p>
              </div>
            )}

            {/* Models List */}
            {!isLoadingModels && models.length === 0 && !modelsError && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-sm">
                <p className="text-gray-600">Enter your API key to load available models</p>
              </div>
            )}

            {/* OpenRouter: Simple scrollable list with search */}
            {!isLoadingModels && provider === 'openrouter' && filteredModels.length > 0 && (
              <div className="max-h-[500px] overflow-y-auto space-y-3 border border-gray-200 rounded-sm p-4">
                {filteredModels.map(renderModelButton)}
              </div>
            )}

            {/* Other providers: Latest/Older sections */}
            {!isLoadingModels && provider !== 'openrouter' && models.length > 0 && (
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
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-8 border-t border-gray-200 mt-8">
            <div className="flex items-center justify-between gap-6">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-sm"
              >
                Start Processing
              </button>

              {/* Token Usage Estimate */}
              {(() => {
                const estimate = calculateTokenEstimate()
                if (!estimate) return null

                return (
                  <div className="border border-gray-200 rounded-sm px-6 py-4 bg-gray-50">
                    <p className="text-xs font-medium text-gray-900 mb-3">Estimated Token Usage</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-xs text-gray-600 font-light">Max Input</span>
                        <span className="font-mono font-semibold text-sm text-gray-900">
                          {estimate.totalInputTokens.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-xs text-gray-600 font-light">Max Output</span>
                        <span className="font-mono font-semibold text-sm text-gray-900">
                          {estimate.totalOutputTokens.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-light">
                        ~{estimate.inputTokensPerRequest.toLocaleString()} input + ~{estimate.outputTokensPerRequest.toLocaleString()} output per row
                      </p>
                      <p className="text-xs text-gray-500 font-light mt-1">
                        {estimate.rows.toLocaleString()} rows total
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
