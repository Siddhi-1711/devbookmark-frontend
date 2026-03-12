// ─── Base URL ────────────────────────────────────────────────────────────────
// Use the same API base as the rest of the app — never hardcode localhost
const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── Image Upload (via backend — keeps Cloudinary credentials server-side) ───
export async function uploadImage(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  const headers = {}
  const storedToken = token || localStorage.getItem('token')
  if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`

  const res = await fetch(`${API_BASE}/api/upload/file`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Image upload failed')
  return data.url
}

// ─── File Upload (via backend, signed with API secret) ───────────────────────
export async function uploadFile(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  const storedToken = token || localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/api/upload/file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${storedToken}`,
    },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'File upload failed')

  return {
    url: data.url,
    name: data.name,
    size: data.size,
    type: data.type,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function formatFileSize(bytes) {
  if (!bytes) return ''
  const b = parseInt(bytes)
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getFileIcon(type) {
  if (!type) return '📄'
  if (type === 'application/pdf') return '📕'
  if (type.includes('word')) return '📘'
  if (type === 'text/plain') return '📄'
  if (type.startsWith('image/')) return '🖼️'
  return '📄'
}