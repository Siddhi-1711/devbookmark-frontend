import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { BookOpen, Check, Trash2, RefreshCw } from 'lucide-react'

export default function ReadingListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | unread | read
  const [page, setPage] = useState(0)
  const [meta, setMeta] = useState({ first: true, last: true, totalPages: 1, totalElements: 0 })
  const size = 10

  useEffect(() => {
    fetchList()
  }, [page, filter])

  const fetchList = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, size })
      const url = filter === 'unread'
        ? `/api/reading-list/unread?${params}`
        : `/api/reading-list?${params}`

      const res = await client.get(url)
      let content = res.data.content || []

      // filter read on frontend since backend has no read-only endpoint
      if (filter === 'read') {
        content = content.filter(item => item.isRead)
      }

      setItems(content)
      setMeta({
        first: res.data.first,
        last: res.data.last,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const markRead = async (resourceId) => {
  try {
    await client.post(`/api/reading-list/${resourceId}/read`)
    setItems(prev => prev.map(item =>
      item.resource.id === resourceId ? { ...item, isRead: true } : item
    ))
  } catch (err) {
    console.error(err)
  }
}

  const remove = async (resourceId) => {
    try {
      await client.delete(`/api/reading-list/${resourceId}`)
      setItems(prev => prev.filter(item => item.resource.id !== resourceId))
      setMeta(prev => ({ ...prev, totalElements: prev.totalElements - 1 }))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = items.filter(i => !i.isRead).length
const markUnread = async (resourceId) => {
  try {
    await client.post(`/api/reading-list/${resourceId}/unread`)
    setItems(prev => prev.map(item =>
      item.resource.id === resourceId ? { ...item, isRead: false } : item
    ))
  } catch (err) {
    console.error(err)
  }
}

  return (
    <AppLayout maxWidth="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-blue-400" />
            Reading List
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {meta.totalElements} saved • {unreadCount} unread
          </p>
        </div>
        <button
          onClick={fetchList}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-sm transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {filter === 'read' ? 'No read items yet' :
             filter === 'unread' ? 'No unread items' :
             'Reading list is empty'}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Click "Read Later" on any resource to add it here
          </p>
          <Link to="/explore" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
            Browse Explore
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className={`bg-gray-900 border rounded-xl p-5 transition ${
                item.isRead ? 'border-gray-800 opacity-70' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Read indicator */}
                <button
                  onClick={() => item.isRead ? markUnread(item.resource.id) : markRead(item.resource.id)}
                  title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    item.isRead
                      ? 'bg-green-500 border-green-500 text-white hover:bg-gray-600 hover:border-gray-600'
                      : 'border-gray-600 hover:border-green-500'
                  }`}
                >
                  {item.isRead && <Check size={11} />}
                </button>

                <div className="flex-1 min-w-0">
                  <Link to={`/resources/${item.resource.id}`}>
                    <h3 className={`font-semibold mb-1 hover:text-blue-400 transition ${
                      item.isRead ? 'text-gray-400' : 'text-white'
                    }`}>
                      {item.resource.title}
                    </h3>
                  </Link>

                  {item.resource.description && (
                    <p className="text-gray-500 text-sm line-clamp-1 mb-2">
                      {item.resource.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{item.resource.ownerName}</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded">
                      {item.resource.type === 'WRITTEN_POST' ? 'Article' : item.resource.type}
                    </span>
                    {item.resource.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-blue-400">#{tag}</span>
                    ))}
                    <span className="ml-auto">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.resource.link && (
                    <a href={item.resource.link} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs">
                      Visit
                    </a>
                  )}
                  <button
                    onClick={() => remove(item.resource.id)}
                    className="text-gray-600 hover:text-red-400 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-gray-500 text-sm">
            Page {page + 1} / {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.first || page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg disabled:opacity-50 transition"
            >Prev</button>
            <button
              disabled={meta.last}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg disabled:opacity-50 transition"
            >Next</button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
