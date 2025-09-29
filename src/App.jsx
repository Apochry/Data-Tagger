import { useState } from 'react'
import ProgressStepper from './components/ProgressStepper'
import UploadStep from './components/UploadStep'
import TagDefinitionStep from './components/TagDefinitionStep'
import ModelSelectionStep from './components/ModelSelectionStep'
import ProcessingStep from './components/ProcessingStep'
import CompletionStep from './components/CompletionStep'

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [csvData, setCsvData] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [tags, setTags] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [processedData, setProcessedData] = useState(null)

  const steps = [
    { label: 'Upload CSV', description: 'Import your data' },
    { label: 'Define Tags', description: 'Create tag structure' },
    { label: 'Select Model', description: 'Choose AI model' },
    { label: 'Process', description: 'Tag responses' },
    { label: 'Download', description: 'Export results' },
  ]

  const handleUploadComplete = (data, column) => {
    setCsvData(data)
    setSelectedColumn(column)
    setCurrentStep(1)
  }

  const handleTagsComplete = (definedTags) => {
    setTags(definedTags)
    setCurrentStep(2)
  }

  const handleModelComplete = (key, model) => {
    setApiKey(key)
    setSelectedModel(model)
    setCurrentStep(3)
  }

  const handleProcessingComplete = (data) => {
    setProcessedData(data)
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            AI Tagger
          </h1>
          <p className="text-gray-600 mt-2 font-light">
            Intelligent survey response classification
          </p>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <ProgressStepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pb-24">
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          {currentStep === 0 && (
            <UploadStep onComplete={handleUploadComplete} />
          )}
          {currentStep === 1 && (
            <TagDefinitionStep onComplete={handleTagsComplete} />
          )}
          {currentStep === 2 && (
            <ModelSelectionStep onComplete={handleModelComplete} />
          )}
          {currentStep === 3 && (
            <ProcessingStep
              csvData={csvData}
              selectedColumn={selectedColumn}
              tags={tags}
              apiKey={apiKey}
              selectedModel={selectedModel}
              onComplete={handleProcessingComplete}
            />
          )}
          {currentStep === 4 && (
            <CompletionStep processedData={processedData} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <p className="text-center text-gray-500 text-sm font-light">
            Powered by Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
