import { useMemo, useState } from 'react'
import Papa from 'papaparse'

export default function TagImportModal({ isOpen, onClose, onImport }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const exampleCsv = `Tag,Description,Example\nPositive Feedback,Use when the response is positive,"I love how easy this tool is to use."\nNegative Feedback,Use when the response expresses dissatisfaction,"Support took too long to respond."\nFeature Request,Use when someone suggests new functionality,"Can you add dark mode?"`

  const templateHref = useMemo(() => {
    return 'data:text/csv;charset=utf-8,' + encodeURIComponent(exampleCsv)
  }, [exampleCsv])

  if (!isOpen) return null

  const resetState = () => {
    setIsDragging(false)
    setError('')
    setFileName('')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const normalizeRow = (row) => {
    const name = (row['Tag'] || row['tag'] || '').trim()
    const description = (row['Description'] || row['description'] || '').trim()
    const example = (row['Example'] || row['example'] || '').trim()

    return { name, description, example }
  }

  const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  const buildTagsFromRows = (rows) => {
    const tagMap = new Map()

    rows.forEach((rawRow) => {
      const { name, description, example } = normalizeRow(rawRow)
      if (!name) {
        return
      }

      if (!tagMap.has(name)) {
        tagMap.set(name, {
          name,
          description,
          examples: [],
        })
      }

      const tagEntry = tagMap.get(name)

      if (description && !tagEntry.description) {
        tagEntry.description = description
      }

      if (example) {
        tagEntry.examples.push(example)
      }
    })

    const tags = Array.from(tagMap.values()).map((tag) => ({
      id: createId(),
      name: tag.name,
      description: tag.description || '',
      examples: tag.examples.length > 0 ? tag.examples : [],
    }))

    return tags
  }

  const handleParsedCsv = (results) => {
    const { data, errors, meta } = results

    if (errors && errors.length > 0) {
      console.error('Error parsing tag CSV', errors)
      setError('There was a problem parsing the CSV. Please check the file and try again.')
      return
    }

    const normalizedHeaders = meta.fields?.map((field) => field.toLowerCase()) || []
    const requiredHeaders = ['tag', 'description', 'example']
    const missingHeaders = requiredHeaders.filter(
      (header) => !normalizedHeaders.includes(header)
    )

    if (missingHeaders.length > 0) {
      setError('Your CSV must include columns named Tag, Description, and Example.')
      return
    }

    const tags = buildTagsFromRows(data)

    if (tags.length === 0) {
      setError('No valid tags were found in the CSV. Please ensure each row has a Tag value.')
      return
    }

    onImport(tags)
    resetState()
  }

  const handleFile = (file) => {
    if (!file) {
      return
    }

    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')

    if (!isCsv) {
      setError('Please upload a CSV file in the correct format.')
      return
    }

    setFileName(file.name)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: handleParsedCsv,
      error: (parseError) => {
        console.error('CSV parse error', parseError)
        setError('There was a problem parsing the CSV. Please try again.')
      },
    })
  }

  const handleFileInput = (event) => {
    const file = event.target.files?.[0]
    handleFile(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-sm w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Import Tags from CSV</h2>
            <p className="text-sm text-gray-600 mt-1 font-light">
              Upload a CSV with columns for Tag, Description, and Example to quickly define your tags.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="grid gap-5 xl:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-sm p-6 sm:p-10 lg:p-12 text-center transition-colors ${
                  isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
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
                <p className="text-gray-700 mb-2 font-medium">Drop your CSV file here</p>
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

                {fileName && (
                  <p className="text-xs text-gray-500 mt-4">Selected file: {fileName}</p>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-sm text-sm text-yellow-800 text-left">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-5 xl:border-t-0 xl:pt-0 xl:border-l xl:border-gray-200 xl:pl-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">CSV Template</p>
                <a
                  href={templateHref}
                  download="tag-template.csv"
                  className="text-sm text-gray-900 font-medium hover:underline"
                >
                  Download template
                </a>
              </div>
              <p className="text-xs text-gray-500 font-light mb-4">
                Match these columns exactly in your CSV. You can add multiple rows for the same tag to provide additional examples.
              </p>
              <div className="border border-gray-200 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-[560px] w-full divide-y divide-gray-200 text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-gray-700">Tag</th>
                        <th className="px-4 py-2 font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-2 font-semibold text-gray-700">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-gray-900">Positive Feedback</td>
                        <td className="px-4 py-3 text-gray-600">Use when the response is positive.</td>
                        <td className="px-4 py-3 text-gray-500 italic">"I love how easy this tool is to use."</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">Negative Feedback</td>
                        <td className="px-4 py-3 text-gray-600">Use when the response expresses dissatisfaction.</td>
                        <td className="px-4 py-3 text-gray-500 italic">"Support took too long to respond."</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-900">Feature Request</td>
                        <td className="px-4 py-3 text-gray-600">Use when someone suggests new functionality.</td>
                        <td className="px-4 py-3 text-gray-500 italic">"Can you add dark mode?"</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


