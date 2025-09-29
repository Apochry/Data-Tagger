import { useState } from 'react'

export default function TagDefinitionStep({ onComplete }) {
  const [tags, setTags] = useState([
    {
      id: Date.now(),
      name: '',
      description: '',
      examples: [''],
    },
  ])

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
    if (newTags[tagIndex].examples.length > 1) {
      newTags[tagIndex].examples.splice(exampleIndex, 1)
      setTags(newTags)
    }
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

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Define Your Tags</h2>
      <p className="text-gray-600 mb-8 font-light">
        Create the classification structure for your survey responses
      </p>

      <div className="space-y-6 mb-8">
        {tags.map((tag, tagIndex) => (
          <div
            key={tag.id}
            className="border border-gray-200 rounded-sm p-6 bg-white"
          >
            {/* Tag Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tag {tagIndex + 1}
              </h3>
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

            {/* Tag Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                value={tag.name}
                onChange={(e) => updateTag(tagIndex, 'name', e.target.value)}
                placeholder="e.g., Positive Feedback"
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            {/* Tag Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={tag.description}
                onChange={(e) =>
                  updateTag(tagIndex, 'description', e.target.value)
                }
                placeholder="Describe when this tag should be applied..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
              />
            </div>

            {/* Examples */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  {tag.examples.length > 1 && (
                    <button
                      onClick={() => deleteExample(tagIndex, exampleIndex)}
                      className="px-3 text-gray-600 hover:text-red-600"
                      title="Remove example"
                    >
                      ×
                    </button>
                  )}
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
    </div>
  )
}
