import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { BookMarked, Plus, Trash2, X, CheckCircle } from 'lucide-react'

export default function SeriesPage() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', slug: '', coverImage: '', isComplete: false })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchSeries() }, [])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/series/me')
      setSeries(res.data.content || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm(f => ({ ...f, title, slug: autoSlug(title) }))
  }

  const createSeries = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const res = await client.post('/api/series', form)
      setSeries(prev => [res.data, ...prev])
      setShowCreate(false)
      setForm({ title: '', description: '', slug: '', coverImage: '', isComplete: false })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create series')
    } finally { setCreating(false) }
  }

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this series?')) return
    try {
      await client.delete(`/api/series/${id}`)
      setSeries(prev => prev.filter(s => s.id !== id))
    } catch (err) { console.error(err) }
  }

  return (
    <AppLayout maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <BookMarked size={22} className="text-blue-400" /> Series
          </h1>
          <p className="text-gray-400 text-sm mt-1">Group resources into ordered series</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
        >
          <Plus size={16} /> New Series
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setShowCreate(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">New Series</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={createSeries} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Spring Boot Mastery"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder="spring-boot-mastery"
                />
                <p className="text-gray-600 text-xs mt-1">URL-friendly, lowercase, hyphens only</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="What is this series about?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cover Image URL (optional)</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No series yet</p>
          <p className="text-gray-600 text-sm mb-4">Create a series to group related resources in order</p>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
            Create Series
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {series.map(s => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
              {s.coverImage && (
                <img src={s.coverImage} alt={s.title}
                  className="w-full h-32 object-cover"
                  onError={e => e.target.style.display = 'none'} />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/series/${s.slug}`}>
                    <h3 className="text-white font-semibold hover:text-blue-400 transition">{s.title}</h3>
                  </Link>
                  <button onClick={() => deleteSeries(s.id)}
                    className="text-gray-600 hover:text-red-400 transition ml-3 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
                {s.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{s.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{s.totalParts} parts</span>
                  {s.isComplete && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={12} /> Complete
                    </span>
                  )}
                  <span className="ml-auto font-mono text-gray-600">/{s.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}