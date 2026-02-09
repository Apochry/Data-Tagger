import { useEffect, useRef, useState } from 'react'

function moveItem(list, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
    return list
  }

  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function moveItemToInsertionIndex(list, fromIndex, insertionIndex) {
  if (fromIndex < 0 || insertionIndex < 0 || fromIndex >= list.length || insertionIndex > list.length) {
    return list
  }

  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  const adjustedInsertionIndex = fromIndex < insertionIndex ? insertionIndex - 1 : insertionIndex
  next.splice(adjustedInsertionIndex, 0, moved)
  return next
}

export default function TagReorderModal({ isOpen, onClose, tags, onReorder }) {
  const [orderedTags, setOrderedTags] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState(null)
  const listContainerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setOrderedTags(tags || [])
      setDraggedIndex(null)
      setDropIndicatorIndex(null)
    }
  }, [isOpen, tags])

  if (!isOpen) return null

  const moveTag = (fromIndex, toIndex) => {
    setOrderedTags((current) => moveItem(current, fromIndex, toIndex))
  }

  const maybeAutoScroll = (event) => {
    if (draggedIndex === null) {
      return
    }

    const container = listContainerRef.current
    if (!container) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const threshold = 56
    const speed = 20

    if (event.clientY < containerRect.top + threshold) {
      container.scrollTop -= speed
    } else if (event.clientY > containerRect.bottom - threshold) {
      container.scrollTop += speed
    }
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
    setDropIndicatorIndex(index)
  }

  const handleDragOver = (event, index) => {
    event.preventDefault()
    maybeAutoScroll(event)

    const row = event.currentTarget
    const rowRect = row.getBoundingClientRect()
    const nextDropIndicatorIndex =
      event.clientY < rowRect.top + rowRect.height / 2 ? index : index + 1

    if (dropIndicatorIndex !== nextDropIndicatorIndex) {
      setDropIndicatorIndex(nextDropIndicatorIndex)
    }
  }

  const handleDrop = (event, index) => {
    event.preventDefault()
    event.stopPropagation()
    if (draggedIndex === null) {
      return
    }

    const insertionIndex = dropIndicatorIndex === null ? index : dropIndicatorIndex
    setOrderedTags((current) => moveItemToInsertionIndex(current, draggedIndex, insertionIndex))
    setDraggedIndex(null)
    setDropIndicatorIndex(null)
  }

  const handleListDragOver = (event) => {
    event.preventDefault()
    maybeAutoScroll(event)

    if (orderedTags.length === 0) {
      setDropIndicatorIndex(0)
    }
  }

  const handleListDrop = (event) => {
    event.preventDefault()
    if (draggedIndex === null) {
      return
    }

    const insertionIndex = dropIndicatorIndex === null ? orderedTags.length : dropIndicatorIndex
    setOrderedTags((current) => moveItemToInsertionIndex(current, draggedIndex, insertionIndex))
    setDraggedIndex(null)
    setDropIndicatorIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropIndicatorIndex(null)
  }

  const handleSave = () => {
    onReorder(orderedTags)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reorder Tags</h2>
            <p className="text-sm text-gray-600 mt-1 font-light">
              Drag and drop tag names or use the arrows to reorder them.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {orderedTags.length} tags
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={listContainerRef}
          onDragOver={handleListDragOver}
          onDrop={handleListDrop}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4"
        >
          {orderedTags.length === 0 && (
            <p className="text-sm text-gray-500">No tags to reorder yet.</p>
          )}

          <div className="space-y-1">
            {orderedTags.map((tag, index) => (
              <div key={`${tag.id}-${index}`}>
                {draggedIndex !== null && dropIndicatorIndex === index && (
                  <div className="h-0.5 bg-black rounded-full mb-1" />
                )}
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={handleDragEnd}
                  className={`border rounded-sm px-3 py-2 bg-white flex items-center gap-3 cursor-grab active:cursor-grabbing transition-colors ${
                    draggedIndex === index
                      ? 'opacity-60 border-gray-500'
                      : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="shrink-0 grid grid-cols-2 gap-1 p-1 text-gray-400 select-none"
                    title="Drag to reorder"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 6 }).map((_, dotIndex) => (
                      <span key={dotIndex} className="w-[3px] h-[3px] rounded-full bg-current" />
                    ))}
                  </span>
                  <span className="w-6 text-sm text-gray-500">{index + 1}</span>
                  <span className="flex-1 text-sm text-gray-900 truncate" title={tag.name?.trim() ? tag.name : '(Untitled tag)'}>
                    {tag.name?.trim() ? tag.name : '(Untitled tag)'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveTag(index, index - 1)}
                      disabled={index === 0}
                      className={`px-2 py-1 text-xs border rounded-sm transition-colors ${
                        index === 0
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      title="Move up"
                    >
                      <span aria-hidden="true">&uarr;</span>
                    </button>
                    <button
                      onClick={() => moveTag(index, index + 1)}
                      disabled={index === orderedTags.length - 1}
                      className={`px-2 py-1 text-xs border rounded-sm transition-colors ${
                        index === orderedTags.length - 1
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      title="Move down"
                    >
                      <span aria-hidden="true">&darr;</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {draggedIndex !== null && dropIndicatorIndex === orderedTags.length && (
              <div className="h-0.5 bg-black rounded-full mt-1" />
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-sm"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  )
}
