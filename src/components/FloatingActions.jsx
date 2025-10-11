import { useEffect, useRef, useState } from 'react'
import { FaBug } from 'react-icons/fa'
import { FaMugHot } from 'react-icons/fa'

const BUG_REPORT_ENDPOINT = 'https://formsubmit.co/ajax/jansell.research@gmail.com'

export default function FloatingActions() {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [details, setDetails] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const donateFormRef = useRef(null)

  useEffect(() => {
    if (submitStatus && submitStatus.type === 'success') {
      const timer = setTimeout(() => {
        setSubmitStatus(null)
        setIsBugModalOpen(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [submitStatus])

  const handleBugSubmit = async (event) => {
    event.preventDefault()

    if (!details.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please describe what went wrong so we can help.' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    const formData = new FormData()
    formData.append('_subject', 'Data Tagger Bug Report')
    formData.append('_template', 'table')
    formData.append('Details', details.trim())
    formData.append('Page URL', window.location.href)

    if (contactEmail.trim()) {
      formData.append('Contact Email', contactEmail.trim())
    }

    attachments.forEach((file, index) => {
      formData.append(`Attachment ${index + 1}`, file, file.name)
    })

    try {
      const response = await fetch(BUG_REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to send bug report. Please try again later.')
      }

      setSubmitStatus({ type: 'success', message: 'Bug report sent. Thank you!' })
      setDetails('')
      setContactEmail('')
      setAttachments([])
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (event) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files))
    }
  }

  const removeAttachment = (fileName) => {
    setAttachments((prev) => prev.filter((file) => file.name !== fileName))
  }

  const handleDonate = () => {
    if (donateFormRef.current) {
      donateFormRef.current.submit()
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">
        <button
          type="button"
          onClick={() => setIsBugModalOpen(true)}
          className="group flex items-center gap-0 overflow-hidden rounded-full bg-white px-0 shadow-lg shadow-gray-900/10 transition-all duration-300"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 transition-all duration-300 group-hover:mr-2 group-hover:shadow-sm">
            <FaBug className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium uppercase tracking-wide text-gray-900 transition-all duration-300 group-hover:max-w-[120px] group-hover:pr-3">
            report a bug
          </span>
        </button>

        <button
          type="button"
          onClick={handleDonate}
          className="group flex items-center gap-0 overflow-hidden rounded-full bg-white px-0 shadow-lg shadow-gray-900/10 transition-all duration-300"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 transition-all duration-300 group-hover:mr-2 group-hover:shadow-sm">
            <FaMugHot className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium uppercase tracking-wide text-gray-900 transition-all duration-300 group-hover:max-w-[140px] group-hover:pr-4">
            buy me a coffee
          </span>
        </button>

        <form
          ref={donateFormRef}
          action="https://www.paypal.com/donate"
          method="post"
          target="_blank"
          className="hidden"
        >
          <input type="hidden" name="business" value="jansell.york@gmail.com" />
          <input type="hidden" name="no_recurring" value="0" />
          <input type="hidden" name="currency_code" value="USD" />
        </form>
      </div>

      {isBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!isSubmitting) {
                setIsBugModalOpen(false)
                setSubmitStatus(null)
              }
            }}
          />

          <div className="relative w-full max-w-xl rounded-md bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Report a bug</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Spot something odd? Share as much detail as you can so we can reproduce and fix it quickly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsBugModalOpen(false)
                    setSubmitStatus(null)
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBugSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="bug-details">
                  What happened?
                </label>
                <textarea
                  id="bug-details"
                  rows={5}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe what went wrong, what you expected, and any steps to reproduce."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="bug-email">
                  Where can we reach you? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="bug-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="bug-attachments">
                  Attach screenshots or images
                </label>
                <input
                  id="bug-attachments"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
                />

                {attachments.length > 0 && (
                  <ul className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    {attachments.map((file) => (
                      <li key={file.name} className="flex items-center justify-between gap-3">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.name)}
                          className="text-gray-500 hover:text-red-600"
                          title="Remove attachment"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {submitStatus && (
                <div
                  className={`rounded-md border px-3 py-2 text-sm ${
                    submitStatus.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) {
                      setIsBugModalOpen(false)
                      setSubmitStatus(null)
                    }
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {isSubmitting && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  <span>{isSubmitting ? 'Sending...' : 'Submit bug report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

