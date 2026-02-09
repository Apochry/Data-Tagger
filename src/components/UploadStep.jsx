import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import SetupGuideModal from './SetupGuideModal'

export default function UploadStep({ onComplete, initialCsvData, initialSelectedColumn, initialFileName, onReset }) {
  const [csvData, setCsvData] = useState(initialCsvData || null)
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState(initialSelectedColumn || '')
  const [fileName, setFileName] = useState(initialFileName || '')
  const [isDragging, setIsDragging] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  useEffect(() => {
    if (initialCsvData) {
      const detectedColumns = initialCsvData.length > 0 ? Object.keys(initialCsvData[0]) : []
      setColumns(detectedColumns)
    }
  }, [initialCsvData])

  const handleFile = (file) => {
    const isCsv = file && (file.type === 'text/csv' || file.name?.toLowerCase().endsWith('.csv'))

    if (isCsv) {
      setFileName(file.name)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data)
          setColumns(results.meta.fields)
          setSelectedColumn('')
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
      onComplete(csvData, selectedColumn, fileName)
    }
  }

  const hasUpload = useMemo(() => {
    return Boolean(csvData && csvData.length > 0)
  }, [csvData])

  const handleReset = () => {
    setCsvData(null)
    setColumns([])
    setSelectedColumn('')
    setFileName('')
    if (onReset) {
      onReset()
    }
  }

  const getColumnPreview = (column) => {
    if (!csvData || csvData.length === 0) {
      return []
    }

    const values = csvData
      .map((row) => {
        const value = row?.[column]
        if (value === undefined || value === null) {
          return ''
        }
        if (typeof value === 'string') {
          return value.trim()
        }
        return String(value)
      })
      .filter((value) => value !== '')

    return values.slice(0, 5)
  }

  return (
    <div className="p-12">
      {/* Setup Guide Modal */}
      <SetupGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Upload Your Data</h2>
        <p className="text-gray-600 mt-2 font-light">
          Begin by uploading a CSV file containing your survey responses
        </p>
      </div>

      {/* File Upload Area */}
      {!hasUpload ? (
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
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Remove file
            </button>
          </div>

          {/* Column Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Comment Column
            </h3>
            <p className="text-gray-600 text-sm mb-4 font-light">
              Choose the column containing the comments you'd like to tag
            </p>
            <div className="flex flex-wrap items-start gap-3">
              {columns.map((column) => {
                const isSelected = selectedColumn === column
                const previewItems = isSelected ? getColumnPreview(column) : []

                return (
                  <button
                    key={column}
                    type="button"
                    onClick={() => setSelectedColumn(column)}
                    className={`relative flex w-full flex-col items-start gap-3 overflow-visible rounded-sm border p-4 text-left transition-all md:basis-[calc(50%-0.75rem)] md:flex-none ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <p className="font-medium text-gray-900 flex-1" style={{ wordBreak: 'break-word' }}>
                        {column}
                      </p>
                      {isSelected && (
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          preview
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-full">
                        {previewItems.length > 0 ? (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {previewItems.map((item, index) => (
                              <li
                                key={index}
                                className="rounded-sm border border-gray-200 bg-white p-2 shadow-sm"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">
                            No sample responses detected in this column.
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
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

      {/* Zapier Info Banner - Below Upload */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 mt-8 flex items-start gap-3">
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
    </div>
  )
}
