import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import { BookMarked, ArrowLeft, CheckCircle, Plus, Trash2, X } from 'lucide-react'

export default function SeriesDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddResource, setShowAddResource] = useState(false)
  const [resourceId, setResourceId] = useState('')
  const [partNumber, setPartNumber] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
const [resourceSearch, setResourceSearch] = useState('')
const [searchResults, setSearchResults] = useState([])
const [selectedResource, setSelectedResource] = useState(null)
const [searching, setSearching] = useState(false)
  useEffect(() => { fetchSeries() }, [slug])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/series/${slug}`)
      setSeries(res.data)
      setPartNumber((res.data.totalParts || 0) + 1)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const addResource = async (e) => {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      const res = await client.post(
        `/api/series/${series.id}/resources/${resourceId}?partNumber=${partNumber}`
      )
      setSeries(res.data)
      setResourceId('')
      setPartNumber(res.data.totalParts + 1)
      setShowAddResource(false)
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add resource')
    } finally { setAdding(false) }
  }
const searchResources = async (q) => {
  if (!q.trim()) { setSearchResults([]); return }
  setSearching(true)
  try {
    const res = await client.get(`/api/search/resources?q=${q}&size=5`)
    setSearchResults(res.data.content || [])
  } catch (err) {}
  finally { setSearching(false) }
}

  const removeResource = async (resourceId) => {
    try {
      await client.delete(`/api/series/${series.id}/resources/${resourceId}`)
      setSeries(prev => ({
        ...prev,
        parts: prev.parts.filter(p => p.resourceId !== resourceId),
        totalParts: prev.totalParts - 1
      }))
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <AppLayout maxWidth="max-w-3xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-48 mb-6" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}
      </div>
    </AppLayout>
  )

  if (!series) return (
    <AppLayout maxWidth="max-w-3xl">
      <p className="text-gray-400 text-center pt-20">Series not found</p>
    </AppLayout>
  )

  const isOwner = user?.id === series.ownerId

  return (
    <AppLayout maxWidth="max-w-3xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
        {series.coverImage && (
          <img src={series.coverImage} alt={series.title}
            className="w-full h-48 object-cover"
            onError={e => e.target.style.display = 'none'} />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl font-bold mb-1">{series.title}</h1>
              {series.description && (
                <p className="text-gray-400 text-sm mb-3">{series.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>By {series.ownerName}</span>
                <span>{series.totalParts} parts</span>
                {series.isComplete && (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle size={12} /> Complete
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <button onClick={() => setShowAddResource(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition shrink-0">
                <Plus size={14} /> Add Part
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setShowAddResource(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Add Part to Series</h3>
              <button onClick={() => setShowAddResource(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {addError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg mb-4 text-sm">
                {addError}
              </div>
            )}
            <form onSubmit={addResource} className="space-y-4">
              {addError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Search Resource</label>
                {selectedResource ? (
                  <div className="flex items-center justify-between bg-blue-600/15 border border-blue-600/30 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{selectedResource.title}</p>
                      <p className="text-gray-400 text-xs">{selectedResource.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedResource(null); setResourceId(''); setSearchResults([]) }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={resourceSearch}
                      onChange={(e) => {
                        setResourceSearch(e.target.value)
                        searchResources(e.target.value)
                      }}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                      placeholder="Search your resources..."
                    />
                    {searching && (
                      <p className="text-gray-500 text-xs mt-1">Searching...</p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl mt-1 z-10 overflow-hidden">
                        {searchResults.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedResource(r)
                              setResourceId(r.id)
                              setSearchResults([])
                              setResourceSearch('')
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-800 transition border-b border-gray-800 last:border-0"
                          >
                            <p className="text-white text-sm">{r.title}</p>
                            <p className="text-gray-500 text-xs">{r.type} • {r.ownerName}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Part Number</label>
                <input
                  type="number"
                  value={partNumber}
                  onChange={e => setPartNumber(parseInt(e.target.value))}
                  min={1}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={adding || !selectedResource}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                >
                  {adding ? 'Adding...' : 'Add Part'}
                </button>
                <button type="button" onClick={() => setShowAddResource(false)}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      {series.parts?.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <BookMarked size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No parts yet</p>
          {isOwner && (
            <button onClick={() => setShowAddResource(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
              Add First Part
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {series.parts?.map(part => (
            <div key={part.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                  {part.partNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/resources/${part.resourceId}`}>
                    <h3 className="text-white font-medium hover:text-blue-400 transition mb-1">
                      {part.resourceTitle}
                    </h3>
                  </Link>
                  {part.resourceDescription && (
                    <p className="text-gray-500 text-sm line-clamp-1">{part.resourceDescription}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <span>{part.resourceType === 'WRITTEN_POST' ? 'Article' : part.resourceType}</span>
                    {part.isPublished && (
                      <span className="text-green-500">Published</span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => removeResource(part.resourceId)}
                    className="text-gray-600 hover:text-red-400 transition shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}