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
      const msg =
        err.response?.data?.fieldErrors?.name ||
        err.response?.data?.message ||
        'Failed to create collection'
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <FolderOpen size={22} className="shrink-0 text-blue-400" />
            <span>Collections</span>
          </h1>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-400">
            Organize your resources into collections
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto sm:px-5 sm:py-2.5"
        >
          <Plus size={16} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:px-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full rounded-t-2xl border border-gray-800 bg-gray-900 p-4 sm:max-w-md sm:rounded-2xl sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">
                New Collection
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createCollection} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                  placeholder="e.g. Spring Boot Resources"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                  placeholder="What's in this collection?"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Visibility</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                      isPublic
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Globe size={14} />
                    Public
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                      !isPublic
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Lock size={14} />
                    Private
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="w-full rounded-lg bg-gray-800 px-5 py-2.5 text-sm text-white transition hover:bg-gray-700 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-gray-800 bg-gray-900 animate-pulse"
            />
          ))}
        </div>
      ) : collections.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[60vh] sm:py-16">
          <FolderOpen size={52} className="mb-4 text-gray-700 sm:size-[56px]" />
          <p className="mb-2 text-xl text-gray-300 sm:text-2xl">
            No collections yet
          </p>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500 sm:text-base">
            Create your first collection to organize resources
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-6"
          >
            Create Collection
          </button>
        </div>
      ) : (
        /* Collection grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collections.map(c => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700 sm:p-5"
            >
              <div className="mb-3 flex items-start gap-3">
                <Link to={`/collections/${c.id}`} className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-semibold text-white transition hover:text-blue-400 sm:text-lg">
                    {c.name}
                  </h3>

                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-400 break-words">
                      {c.description}
                    </p>
                  )}
                </Link>

                <div className="ml-1 flex shrink-0 items-center gap-1 sm:gap-2">
                  <button
                    onClick={() =>
                      navigate(`/explore?pickFor=${c.id}&pickName=${encodeURIComponent(c.name)}`)
                    }
                    title="Add resources from Explore"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-blue-400"
                  >
                    <BookPlus size={15} />
                  </button>

                  <button
                    onClick={() => deleteCollection(c.id)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                {c.isPublic ? (
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock size={12} />
                    Private
                  </span>
                )}

                <span>{c.itemCount ?? 0} resources</span>

                <span className="sm:ml-auto">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}