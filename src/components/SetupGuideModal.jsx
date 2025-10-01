export default function SetupGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Zapier Automation Setup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚡ Automate Your Survey Tagging
              </h3>
              <p className="text-gray-600 font-light">
                Automatically tag survey responses as they come in. Connect with 5,000+ apps via Zapier.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Where Processing Happens</p>
                  <p className="text-xs text-gray-700 font-light">
                    When using Zapier/API, your data is processed on <strong>our Vercel servers</strong> (not your computer). 
                    While nothing is stored, your CSV data and AI keys do pass through our infrastructure during processing. 
                    For maximum privacy, use the web interface where everything runs in your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Get Your AI Provider API Key</h4>
                    <p className="text-sm text-gray-600 font-light mb-2">
                      Sign up with one of these providers and get an API key:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <strong>Google AI:</strong> <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get free API key</a></li>
                      <li>• <strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get API key</a> (requires billing)</li>
                      <li>• <strong>OpenRouter:</strong> <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get API key</a> (pay-as-you-go)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Create a Zapier Account</h4>
                    <p className="text-sm text-gray-600 font-light mb-2">
                      Sign up for a free Zapier account at <a href="https://zapier.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">zapier.com</a>
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      Free tier includes 100 tasks per month, perfect for testing!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Set Up Your Zap</h4>
                    <p className="text-sm text-gray-600 font-light mb-2">
                      In Zapier, create a new Zap with:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <strong>Trigger:</strong> Your data source (Google Sheets, Forms, Typeform, etc.)</li>
                      <li>• <strong>Action:</strong> Webhooks by Zapier → POST</li>
                      <li>• <strong>URL:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">https://data-tagger.vercel.app/api/tag</code></li>
                      <li>• <strong>Data:</strong> Your CSV data, tags, and AI key (see guide below)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Test & Activate</h4>
                    <p className="text-sm text-gray-600 font-light">
                      Test your Zap to make sure it works, then turn it on. Your responses will now be automatically tagged!
                    </p>
                  </div>
                </div>
            </div>

            {/* Best For */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">⚡ Best For:</h4>
              <ul className="text-sm text-gray-600 space-y-1 font-light">
                <li>• Recurring surveys (daily/weekly responses)</li>
                <li>• Large datasets (thousands of rows)</li>
                <li>• Automatic processing without manual intervention</li>
                <li>• Integration with other tools (Google Sheets, Airtable, etc.)</li>
              </ul>
            </div>

            {/* Example Use Cases */}
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Example Use Cases:</h4>
              <ul className="text-sm text-gray-600 space-y-1 font-light">
                <li>• Google Forms → Auto-tag → Google Sheets</li>
                <li>• Typeform → Auto-tag → Airtable → Slack alert</li>
                <li>• Weekly batch process survey data</li>
                <li>• Route negative feedback to support team</li>
              </ul>
            </div>

            {/* Documentation Links */}
            <div className="space-y-2 mt-6">
              <a
                href="https://github.com/Apochry/Data-Tagger/blob/main/QUICK_START_ZAPIER.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors text-center"
              >
                🚀 Quick Start Guide (5 min)
              </a>
              <a
                href="https://github.com/Apochry/Data-Tagger/blob/main/API_DOCUMENTATION.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors text-center"
              >
                📚 Full API Documentation
              </a>
              <a
                href="https://github.com/Apochry/Data-Tagger/blob/main/ZAPIER_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors text-center"
              >
                ⚡ Detailed Zapier Guide
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-xs text-gray-700 font-medium">🔒 Privacy & Security</p>
              <p className="text-xs text-gray-500 font-light mt-1">
                Your AI API keys are <strong>never stored</strong> on our servers. They're used only during processing and immediately discarded. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

