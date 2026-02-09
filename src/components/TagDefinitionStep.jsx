import { useState, useEffect } from 'react'
import TagImportModal from './TagImportModal'

export default function TagDefinitionStep({ onComplete, initialTags, onClearAll }) {
  const [tags, setTags] = useState(() => {
    // Use initialTags if provided and not empty, otherwise use default empty tag
    if (initialTags && initialTags.length > 0) {
      console.log('📋 Loading saved tags from localStorage:', initialTags.length, 'tags')
      return initialTags
    }
    console.log('📋 Starting with empty tag template')
    return [
      {
        id: Date.now(),
        name: '',
        description: '',
        examples: [''],
      },
    ]
  })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Autosave tags to localStorage whenever they change
  useEffect(() => {
    // Only save if there's at least one tag with a name (don't save empty template)
    const hasContent = tags.some(tag => tag.name.trim() !== '' || tag.description.trim() !== '' || tag.examples.some(ex => ex.trim() !== ''))
    if (hasContent) {
      console.log('💾 Autosaving tags to localStorage:', tags.length, 'tags')
      localStorage.setItem('aiTagger_tags', JSON.stringify(tags))
    }
  }, [tags])

  const addTag = () => {
    setTags([
      ...tags,
      {
        id: Date.now(),
        name: '',
        description: '',
        examples: [''],
      },
    ])
  }

  const duplicateTag = (index) => {
    const tagToDuplicate = tags[index]
    setTags([
      ...tags,
      {
        ...tagToDuplicate,
        id: Date.now(),
      },
    ])
  }

  const deleteTag = (index) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index))
    }
  }

  const updateTag = (index, field, value) => {
    const newTags = [...tags]
    newTags[index][field] = value
    setTags(newTags)
  }

  const autoResizeTextarea = (element) => {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  const addExample = (tagIndex) => {
    const newTags = [...tags]
    newTags[tagIndex].examples.push('')
    setTags(newTags)
  }

  const updateExample = (tagIndex, exampleIndex, value) => {
    const newTags = [...tags]
    newTags[tagIndex].examples[exampleIndex] = value
    setTags(newTags)
  }

  const deleteExample = (tagIndex, exampleIndex) => {
    const newTags = [...tags]
    newTags[tagIndex].examples.splice(exampleIndex, 1)
    setTags(newTags)
  }

  const handleContinue = () => {
    // Validate that all tags have names
    const validTags = tags.filter(tag => tag.name.trim() !== '')
    if (validTags.length === 0) {
      alert('Please define at least one tag with a name')
      return
    }
    // Filter out empty examples
    const cleanedTags = validTags.map(tag => ({
      ...tag,
      examples: tag.examples.filter(ex => ex.trim() !== '')
    }))
    onComplete(cleanedTags)
  }

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all saved tags? This cannot be undone.')) {
      setTags([
        {
          id: Date.now(),
          name: '',
          description: '',
          examples: [''],
        },
      ])
      if (onClearAll) {
        onClearAll()
      }
    }
  }

  const handleImportedTags = (importedTags) => {
    if (!importedTags || importedTags.length === 0) {
      return
    }

    setTags(importedTags)
    setIsImportModalOpen(false)
  }

  return (
    <div className="p-12">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">Define Your Tags</h2>
          <p className="text-gray-600 mt-2 font-light">
            Create the classification structure for your survey responses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-sm"
          >
            Import Tags from CSV
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-sm hover:border-red-400 transition-colors"
            title="Delete all saved tags"
          >
            Delete All
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-8 mt-8">
        {tags.map((tag, tagIndex) => (
          <div
            key={tag.id}
            className="border border-gray-200 border-l-2 border-l-gray-400 rounded-sm p-4 bg-white"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-lg font-semibold text-gray-900">
                {tagIndex + 1}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateTag(tagIndex)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                  title="Duplicate"
                >
                  Duplicate
                </button>
                {tags.length > 1 && (
                  <button
                    onClick={() => deleteTag(tagIndex)}
                    className="text-sm text-gray-600 hover:text-red-600 underline"
                    title="Delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-start">
              {/* Tag Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tag Name
                </label>
                <textarea
                  value={tag.name}
                  onChange={(e) => updateTag(tagIndex, 'name', e.target.value)}
                  onInput={(e) => autoResizeTextarea(e.target)}
                  ref={autoResizeTextarea}
                  placeholder="e.g., Positive Feedback"
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none overflow-hidden leading-tight"
                />
              </div>

              {/* Tag Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  value={tag.description}
                  onChange={(e) =>
                    updateTag(tagIndex, 'description', e.target.value)
                  }
                  onInput={(e) => autoResizeTextarea(e.target)}
                  ref={autoResizeTextarea}
                  placeholder="Describe when this tag should be applied..."
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none overflow-hidden leading-tight"
                />
              </div>
            </div>

            {/* Examples */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Examples (Optional)
              </label>
              {tag.examples.map((example, exampleIndex) => (
                <div key={exampleIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={example}
                    onChange={(e) =>
                      updateExample(tagIndex, exampleIndex, e.target.value)
                    }
                    placeholder={`Example ${exampleIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <button
                    onClick={() => deleteExample(tagIndex, exampleIndex)}
                    className="px-3 text-gray-600 hover:text-red-600"
                    title="Remove example"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addExample(tagIndex)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                + Add Example
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tag Button */}
      <button
        onClick={addTag}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors font-medium"
      >
        + Add Tag
      </button>

      {/* Continue Button */}
      <div className="pt-8 border-t border-gray-200 mt-8">
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Continue to Model Selection
        </button>
      </div>

      <TagImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportedTags}
      />
    </div>
  )
}
