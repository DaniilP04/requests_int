export function normalizeColor(value?: string | null) {
  return (value || '').trim().toLocaleLowerCase('ru-RU')
}

export function normalizeProductName(value?: string | null) {
  return (value || '').trim()
}

export function extractBraceletColor(deviceType?: string | null) {
  const raw = normalizeProductName(deviceType)
  const match = raw.match(/\(([^)]+)\)/)
  return match ? match[1].trim() : ''
}

export function resolveProductFromDeviceType(deviceType?: string | null) {
  const normalized = normalizeProductName(deviceType)

  if (normalized.startsWith('Браслет')) {
    return {
      name: 'Браслет',
      color: extractBraceletColor(normalized)
    }
  }

  if (normalized.startsWith('Карта')) {
    return { name: 'Карта', color: '' }
  }

  if (normalized.startsWith('Брелок')) {
    return { name: 'Брелок', color: '' }
  }

  return { name: normalized, color: '' }
}

export function formatProductLabel(name: string, color?: string | null) {
  const normalizedColor = (color || '').trim()
  return normalizedColor ? `${name} (${normalizedColor})` : name
}
