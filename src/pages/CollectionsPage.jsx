import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { FolderOpen, Plus, Lock, Globe, Trash2, X, BookPlus } from 'lucide-react'

export default function CollectionsPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/collections/me')
      setCollections(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createCollection = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await client.post('/api/collections', {
        name: name.trim(),
        description: description.trim(),
        isPublic
      })
      setCollections(prev => [...prev, res.data])
      setShowCreate(false)
      setName('')
      setDescription('')
      setIsPublic(true)
    } catch (err) {
      const msg = err.response?.data?.fieldErrors?.name || err.response?.data?.message || 'Failed to create collection'
      alert(msg)
    } finally {
      setCreating(false)
    }
  }

  const deleteCollection = async (id) => {
    if (!window.confirm('Delete this collection?')) return
    try {
      await client.delete(`/api/collections/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AppLayout maxWidth="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <FolderOpen size={22} className="text-blue-400" />
            Collections
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize your resources into collections</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
        >
          <Plus size={16} /> New Collection
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setShowCreate(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">New Collection</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createCollection} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Spring Boot Resources"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="What's in this collection?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Visibility</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsPublic(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isPublic ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    <Globe size={14} /> Public
                  </button>
                  <button type="button" onClick={() => setIsPublic(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${!isPublic ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    <Lock size={14} /> Private
                  </button>
                </div>
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No collections yet</p>
          <p className="text-gray-600 text-sm mb-4">Create your first collection to organize resources</p>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/collections/${c.id}`} className="flex-1">
                  <h3 className="text-white font-semibold hover:text-blue-400 transition">{c.name}</h3>
                  {c.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{c.description}</p>
                  )}
                </Link>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => navigate(`/explore?pickFor=${c.id}&pickName=${encodeURIComponent(c.name)}`)}
                    title="Add resources from Explore"
                    className="text-gray-600 hover:text-blue-400 transition"
                  >
                    <BookPlus size={15} />
                  </button>
                  <button onClick={() => deleteCollection(c.id)}
                    className="text-gray-600 hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {c.isPublic
                  ? <span className="flex items-center gap-1"><Globe size={12} /> Public</span>
                  : <span className="flex items-center gap-1"><Lock size={12} /> Private</span>
                }
                <span>{c.itemCount ?? 0} resources</span>
                <span className="ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}