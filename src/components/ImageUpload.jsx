import { useState, useRef } from 'react'
import { uploadImage } from '../utils/uploadImage'
import { Upload, X, Link as LinkIcon } from 'lucide-react'

export default function ImageUpload({ value, onChange, label = "Cover Image" }) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState('url') // 'url' | 'upload'
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
            mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Upload size={12} /> Upload from device
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
            mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <LinkIcon size={12} /> Paste URL
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
        />
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-700 rounded-xl py-8 text-center hover:border-gray-600 transition cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <p className="text-gray-400 text-sm">Uploading...</p>
            ) : (
              <>
                <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Click to upload image</p>
                <p className="text-gray-600 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="mt-3 relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg"
            onError={e => e.target.style.display = 'none'}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}