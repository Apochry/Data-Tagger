import Papa from 'papaparse'

export default function CompletionStep({ processedData, tags }) {
  const safeProcessedData = Array.isArray(processedData) ? processedData : []
  const safeTags = Array.isArray(tags) ? tags : []

  const hasProcessedData = safeProcessedData.length > 0

  const handleDownload = () => {
    if (!hasProcessedData) {
      return
    }

    const csv = Papa.unparse(safeProcessedData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `tagged_responses_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate statistics
  const totalRows = safeProcessedData.length
  const taggedRows = safeProcessedData.filter(
    (row) => row.AI_Tags && row.AI_Tags.trim() !== ''
  ).length

  // Calculate statistics for each tag
  const tagStats = safeTags.map((tag) => {
    const count = safeProcessedData.filter((row) => row[tag.name] === 1).length
    return {
      name: tag.name,
      count,
      percentage: totalRows > 0 ? (count / totalRows) * 100 : 0,
    }
  })

  const formatPercentage = (value) => `${value.toFixed(1)}%`

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        {hasProcessedData ? 'Processing Complete' : 'No tagged data yet'}
      </h2>
      <p className="text-gray-600 mb-12 font-light">
        {hasProcessedData
          ? 'Your survey responses have been successfully tagged'
          : 'Tag your survey responses to see statistics and download your results.'}
      </p>

      {/* Success Icon */}
      <div className="flex justify-center mb-12">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Statistics */}
      {hasProcessedData ? (
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-3xl font-bold text-gray-900">{totalRows}</p>
              <p className="text-sm text-gray-600 mt-1">Total Responses</p>
            </div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-3xl font-bold text-gray-900">{taggedRows}</p>
              <p className="text-sm text-gray-600 mt-1">Tagged Responses</p>
            </div>
          </div>

          {/* Tag Breakdown */}
          <div className="border border-gray-200 rounded-sm divide-y divide-gray-200">
            {tagStats.map((stat) => (
              <div key={stat.name} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{stat.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {stat.count} responses
                    </span>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {formatPercentage(stat.percentage)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, stat.percentage))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-sm border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Download tagged results when ready</h3>
          <p className="mt-2 text-sm text-gray-600">
            Once your data is processed, you'll see the statistics breakdown and can export the tagged CSV here.
          </p>
        </div>
      )}

      {/* Download Button */}
      <div className="border-t border-gray-200 pt-8">
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-gray-900 text-white font-medium text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!hasProcessedData}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Tagged CSV
        </button>
      </div>
    </div>
  )
}
