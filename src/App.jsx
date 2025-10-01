import { useState, useEffect } from 'react'
import ProgressStepper from './components/ProgressStepper'
import UploadStep from './components/UploadStep'
import TagDefinitionStep from './components/TagDefinitionStep'
import ModelSelectionStep from './components/ModelSelectionStep'
import ProcessingStep from './components/ProcessingStep'
import CompletionStep from './components/CompletionStep'

function App() {
  // Load initial state from localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('aiTagger_currentStep')
    return saved ? parseInt(saved) : 0
  })
  
  const [csvData, setCsvData] = useState(() => {
    const saved = localStorage.getItem('aiTagger_csvData')
    return saved ? JSON.parse(saved) : null
  })
  
  const [selectedColumn, setSelectedColumn] = useState(() => {
    const saved = localStorage.getItem('aiTagger_selectedColumn')
    return saved || null
  })
  
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('aiTagger_tags')
    const parsed = saved ? JSON.parse(saved) : []
    console.log('💾 Loading tags from localStorage:', parsed.length, 'tags found')
    return parsed
  })
  
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [processedData, setProcessedData] = useState(null)

  const steps = [
    { label: 'Upload CSV', description: 'Import your data' },
    { label: 'Define Tags', description: 'Create tag structure' },
    { label: 'Select Model', description: 'Choose AI model' },
    { label: 'Process', description: 'Tag responses' },
    { label: 'Download', description: 'Export results' },
  ]

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('aiTagger_currentStep', currentStep.toString())
  }, [currentStep])

  useEffect(() => {
    if (csvData) {
      localStorage.setItem('aiTagger_csvData', JSON.stringify(csvData))
    }
  }, [csvData])

  useEffect(() => {
    if (selectedColumn) {
      localStorage.setItem('aiTagger_selectedColumn', selectedColumn)
    }
  }, [selectedColumn])

  useEffect(() => {
    if (tags.length > 0) {
      console.log('💾 Saving tags to localStorage:', tags.length, 'tags')
      localStorage.setItem('aiTagger_tags', JSON.stringify(tags))
    }
  }, [tags])

  const handleUploadComplete = (data, column) => {
    setCsvData(data)
    setSelectedColumn(column)
    setCurrentStep(1)
  }

  const handleTagsComplete = (definedTags) => {
    setTags(definedTags)
    setCurrentStep(2)
  }

  const handleModelComplete = (key, model, provider) => {
    setApiKey(key)
    setSelectedModel(model)
    setSelectedProvider(provider)
    setCurrentStep(3)
  }

  const handleProcessingComplete = (data) => {
    setProcessedData(data)
    setCurrentStep(4)
  }

  const handleStepClick = (stepIndex) => {
    // Allow navigation back to any completed step
    // State is preserved, so user can review/modify previous choices
    setCurrentStep(stepIndex)
  }

  const clearAllTags = () => {
    // Clear tags from localStorage and state
    localStorage.removeItem('aiTagger_tags')
    setTags([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Data Tagger
            </h1>
            <p className="text-gray-600 mt-2 font-light">
              Classify survey responses with AI
            </p>
          </div>
          <a
            href="https://github.com/Apochry/Data-Tagger"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-sm hover:border-gray-400 transition-colors"
            title="View source code on GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Open Source
          </a>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <ProgressStepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pb-24">
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          {currentStep === 0 && (
            <UploadStep onComplete={handleUploadComplete} />
          )}
          {currentStep === 1 && (
            <TagDefinitionStep 
              onComplete={handleTagsComplete}
              initialTags={tags}
              onClearAll={clearAllTags}
            />
          )}
          {currentStep === 2 && (
            <ModelSelectionStep 
              onComplete={handleModelComplete}
              csvData={csvData}
              selectedColumn={selectedColumn}
              tags={tags}
            />
          )}
          {currentStep === 3 && (
            <ProcessingStep
              csvData={csvData}
              selectedColumn={selectedColumn}
              tags={tags}
              apiKey={apiKey}
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              onComplete={handleProcessingComplete}
            />
          )}
          {currentStep === 4 && (
            <CompletionStep processedData={processedData} tags={tags} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <p className="text-center text-gray-500 text-sm font-light">
            Open source AI tagging tool. No API keys are stored or shared - your data is processed locally.
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            <a 
              href="https://github.com/Apochry/Data-Tagger" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-600 underline transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
