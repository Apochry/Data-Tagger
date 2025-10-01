import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import SetupGuideModal from './SetupGuideModal'

export default function UploadStep({ onComplete }) {
  const [csvData, setCsvData] = useState(null)
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  // Show guide modal on first visit
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenSetupGuide')
    if (!hasSeenGuide) {
      setShowGuideModal(true)
      localStorage.setItem('hasSeenSetupGuide', 'true')
    }
  }, [])

  const handleFile = (file) => {
    if (file && file.type === 'text/csv') {
      setFileName(file.name)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data)
          setColumns(results.meta.fields)
        },
        error: (error) => {
          alert('Error parsing CSV: ' + error.message)
        },
      })
    } else {
      alert('Please upload a valid CSV file')
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleContinue = () => {
    if (selectedColumn && csvData) {
      onComplete(csvData, selectedColumn)
    }
  }

  return (
    <div className="p-12">
      {/* Setup Guide Modal */}
      <SetupGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />

      {/* Header with Guide Button */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Upload Your Data</h2>
          <p className="text-gray-600 mt-2 font-light">
            Begin by uploading a CSV file containing your survey responses
          </p>
        </div>
        <button
          onClick={() => setShowGuideModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-sm hover:border-gray-400 transition-colors"
          title="View setup options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Setup Options
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mb-8 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-light">
            <strong className="font-medium">New:</strong> Need to automate tagging? We now support{' '}
            <button 
              onClick={() => setShowGuideModal(true)}
              className="text-blue-700 hover:text-blue-800 underline font-medium"
            >
              Zapier integration
            </button>
            {' '}for automatic processing.
          </p>
        </div>
      </div>

      {/* File Upload Area */}
      {!csvData ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-sm p-16 text-center transition-colors ${
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-700 mb-2 font-medium">
            Drop your CSV file here
          </p>
          <p className="text-gray-500 text-sm mb-6">or</p>
          <label className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors">
            Browse Files
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-8">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500">{csvData.length} rows loaded</p>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Comment Column
            </h3>
            <p className="text-gray-600 text-sm mb-4 font-light">
              Choose the column containing the comments you'd like to tag
            </p>
            <div className="grid grid-cols-2 gap-3">
              {columns.map((column) => (
                <button
                  key={column}
                  onClick={() => setSelectedColumn(column)}
                  className={`p-4 text-left border rounded-sm transition-all ${
                    selectedColumn === column
                      ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <p className="font-medium text-gray-900">{column}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          {selectedColumn && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Continue to Tag Definition
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
