const MAX_TAG_LEVEL = 3

const generateTagId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const ensureArray = (value) => (Array.isArray(value) ? value : [])

const buildIdPath = (node, parentIdPath = []) => {
  return [...parentIdPath, node.id]
}

export const findTagByIdPath = (tags, path) => {
  if (!Array.isArray(tags) || !Array.isArray(path) || path.length === 0) {
    return null
  }

  let currentList = tags
  let currentNode = null

  for (const id of path) {
    currentNode = currentList.find((tag) => tag.id === id)
    if (!currentNode) {
      return null
    }
    currentList = ensureArray(currentNode.children)
  }

  return currentNode
}

const normalizeTagNode = (node, level = 1) => {
  if (!node || typeof node !== 'object') {
    return null
  }

  const normalized = {
    id: node.id || generateTagId(),
    name: node.name || '',
    description: node.description || '',
    examples: ensureArray(node.examples).map((example) => (example == null ? '' : example.toString())),
    children: [],
  }

  if (level < MAX_TAG_LEVEL) {
    const childNodes = ensureArray(node.children)
      .map((child) => normalizeTagNode(child, level + 1))
      .filter(Boolean)
    normalized.children = childNodes
  }

  return normalized
}

export const createEmptyTag = (level = 1) => ({
  id: generateTagId(),
  name: '',
  description: '',
  examples: [],
  children: level < MAX_TAG_LEVEL ? [] : [],
})

export const normalizeTags = (raw) => {
  if (!Array.isArray(raw)) {
    return []
  }

  // Handle legacy flat arrays without children
  const appearsLegacy = raw.length > 0 && !('children' in raw[0])

  if (appearsLegacy) {
    return raw
      .map((legacyTag) =>
        normalizeTagNode(
          {
            ...legacyTag,
            children: [],
          },
          1,
        ),
      )
      .filter(Boolean)
  }

  return raw.map((tag) => normalizeTagNode(tag, 1)).filter(Boolean)
}

export const cleanTags = (tags, level = 1) => {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .map((tag) => {
      const name = (tag.name || '').trim()
      if (!name) {
        return null
      }

      const cleaned = {
        id: tag.id || generateTagId(),
        name,
        description: (tag.description || '').trim(),
        examples: ensureArray(tag.examples).map((example) => example?.toString().trim()).filter(Boolean),
        children: [],
      }

      if (level < MAX_TAG_LEVEL) {
        cleaned.children = cleanTags(tag.children || [], level + 1)
      }

      return cleaned
    })
    .filter(Boolean)
}

export const flattenTags = (tags, parentPath = [], parentIdPath = []) => {
  if (!Array.isArray(tags)) {
    return []
  }

  const nodes = []

  tags.forEach((tag) => {
    const name = (tag.name || '').trim()
    if (!name) {
      return
    }

    const path = [...parentPath, name]
    const idPath = buildIdPath(tag, parentIdPath)
    const parentId = parentIdPath.length > 0 ? parentIdPath[parentIdPath.length - 1] : null
    const pathLabel = path.join(' > ')
    const ancestors = parentPath.map((_, index) => parentPath.slice(0, index + 1).join(' > '))

    nodes.push({
      id: tag.id,
      level: path.length,
      name,
      description: tag.description || '',
      examples: ensureArray(tag.examples),
      children: ensureArray(tag.children),
      path,
      idPath,
      pathLabel,
      ancestors,
      parentId,
    })

    if (tag.children && tag.children.length > 0) {
      nodes.push(...flattenTags(tag.children, path, idPath))
    }
  })

  return nodes
}

export const MAX_LEVEL = MAX_TAG_LEVEL

