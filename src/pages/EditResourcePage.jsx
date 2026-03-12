import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import RichTextEditor from '../components/RichTextEditor'
import ImageUpload from '../components/ImageUpload'
import FileUpload from '../components/FileUpload'

const VISIBILITIES = ['PUBLIC', 'FOLLOWERS', 'PRIVATE']
const FILE_UPLOAD_TYPES = ['ARTICLE', 'DOC']

export default function EditResourcePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [tags, setTags] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchResource() }, [id])

  const fetchResource = async () => {
    try {
      const res = await client.get(`/api/resources/${id}`)
      const r = res.data
      if (user && r.ownerId !== user.id) {
        navigate(`/resources/${id}`)
        return
      }
      setResource(r)
      setTitle(r.title || '')
      setDescription(r.description || '')
      setLink(r.link || '')
      setContent(r.content || '')
      setCoverImage(r.coverImage || '')
      setFileUrl(r.fileUrl || '')
      setTags((r.tags || []).join(', '))
      setVisibility(r.visibility || 'PUBLIC')
      setIsPublished(r.isPublished || false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        title,
        description,
        visibility,
        fileUrl: fileUrl || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        ...(resource?.type === 'WRITTEN_POST'
          ? { content, coverImage: coverImage || null }
          : { link }),
      }
      await client.put(`/api/resources/${id}`, payload)
      if (publish && !isPublished) await client.post(`/api/resources/${id}/publish`)
      navigate(`/resources/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/2" />
        <div className="h-12 bg-gray-800 rounded" />
        <div className="h-32 bg-gray-800 rounded" />
      </div>
    </div>
  )

  const isWrittenPost = resource?.type === 'WRITTEN_POST'
  const supportsFileUpload = FILE_UPLOAD_TYPES.includes(resource?.type)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-white text-2xl font-bold mb-6">Edit Resource</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Link or Written Post fields */}
          {!isWrittenPost ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link</label>
                <input
                  type="url" value={link} onChange={e => setLink(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* ✅ File upload for ARTICLE and DOC types */}
              {supportsFileUpload && (
                <FileUpload
                  value={fileUrl}
                  onChange={setFileUrl}
                  label="Attach File (optional) — PDF, DOC, DOCX, TXT"
                />
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                label="Cover Image (optional)"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                {resource && (
                  <RichTextEditor content={content} onChange={setContent} />
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <label className="block text-sm text-gray-400 mb-1">Tags</label>
            <input
              type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="spring, java, backend"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
            />
            {tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} className="px-2 py-0.5 bg-gray-800 text-blue-400 text-xs rounded">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <label className="block text-sm text-gray-400 mb-2">Visibility</label>
            <div className="flex gap-2">
              {VISIBILITIES.map(v => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    visibility === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}>
                  {v.charAt(0) + v.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {isWrittenPost && !isPublished && (
              <button type="button" disabled={saving}
                onClick={e => handleSubmit(e, true)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition">
                Save & Publish
              </button>
            )}

            <button type="button" onClick={() => navigate(`/resources/${id}`)}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}