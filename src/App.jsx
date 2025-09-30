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
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Data Tagger
          </h1>
          <p className="text-gray-600 mt-2 font-light">
            Classify survey responses with AI
          </p>
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
