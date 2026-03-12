import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import client from "../api/client";
import { Link } from "react-router-dom";
import {
  Bell, CheckCheck, Check, Trash2, RefreshCw,
  Heart, Bookmark, UserPlus, MessageSquare, Share2
} from "lucide-react";
import { useAuth } from "../store/authStore";
import { usePageTitle } from '../hooks/usePageTitle'

// Icon + color per notification type
const TYPE_CONFIG = {
  FOLLOWED_YOU:       { icon: UserPlus,       color: 'text-green-400',  bg: 'bg-green-400/10',  label: 'Follow' },
  LIKED_RESOURCE:     { icon: Heart,           color: 'text-red-400',    bg: 'bg-red-400/10',    label: 'Like' },
  SAVED_RESOURCE:     { icon: Bookmark,        color: 'text-blue-400',   bg: 'bg-blue-400/10',   label: 'Save' },
  COMMENTED_RESOURCE: { icon: MessageSquare,   color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Comment' },
  REPOSTED_RESOURCE:  { icon: Share2,          color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Repost' },
  DEFAULT:            { icon: Bell,            color: 'text-gray-400',   bg: 'bg-gray-400/10',   label: 'Alert' },
}
function buildMessage(n) {
  const actor = n.actorName || 'Someone'
  const title = n.resourceTitle ? `"${n.resourceTitle}"` : 'your resource'
  switch (n.type) {
    case 'FOLLOWED_YOU':       return `${actor} started following you`
    case 'LIKED_RESOURCE':     return `${actor} liked ${title}`
    case 'SAVED_RESOURCE':     return `${actor} saved ${title}`
    case 'COMMENTED_RESOURCE': return `${actor} commented on ${title}`
    case 'REPOSTED_RESOURCE':  return `${actor} reposted ${title}`
    default: return `${actor} did something`
  }
}
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotificationRow({ n, onRead, onDelete, busy }) {
  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.DEFAULT
  const Icon = config.icon
  const message = buildMessage(n)

  return (
    <div className={`flex items-start gap-4 px-5 py-4 rounded-xl border transition group ${
      n.read
        ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
        : 'bg-blue-600/5 border-blue-600/30 hover:border-blue-600/50'
    }`}>

      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-relaxed ${n.read ? 'text-gray-300' : 'text-white'}`}>
            {message}
            {n.resourceId && (
              <Link to={`/resources/${n.resourceId}`}
                className="ml-2 text-blue-400 hover:text-blue-300 text-xs transition">
                View →
              </Link>
            )}
          </p>
          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
        </div>

        {/* Time + type badge + actions */}
        <div className="flex items-center gap-3 mt-2">
          {n.createdAt && (
            <span className="text-gray-600 text-xs">{timeAgo(n.createdAt)}</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
            {config.label}
          </span>

          {/* Actor link */}
          {n.actorId && (
            <Link to={`/users/${n.actorId}`}
              className="text-gray-500 hover:text-white text-xs transition">
              @{n.actorName}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            {!n.read && (
              <button onClick={onRead} disabled={busy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-xs transition disabled:opacity-50">
                <Check size={12} /> Read
              </button>
            )}
            <button onClick={onDelete} disabled={busy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 text-xs transition disabled:opacity-50">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  usePageTitle('Notifications')
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const size = 15

  const unreadCount = useMemo(() =>
    data?.content?.filter(n => !n.read).length ?? 0
  , [data])

  const filtered = useMemo(() => {
    if (!data?.content) return []
    if (filter === 'unread') return data.content.filter(n => !n.read)
    return data.content
  }, [data, filter])

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/notifications', { params: { page, size } })
      setData(res.data)
    } catch (e) {
      console.error(e)
      setData({ content: [], first: true, last: true, totalPages: 1, totalElements: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const markRead = async (id) => {
    if (!user) return
    setBusyId(id)
    try {
      await client.post('/api/notifications/read', { ids: [id] })
      setData(prev => prev ? {
        ...prev,
        content: prev.content.map(n => n.id === id ? { ...n, read: true } : n)
      } : prev)
    } catch { await load() }
    finally { setBusyId(null) }
  }

  const markAll = async () => {
    if (!user) return
    setBusyId('ALL')
    try {
      await client.post('/api/notifications/read-all')
      setData(prev => prev ? {
        ...prev,
        content: prev.content.map(n => ({ ...n, read: true }))
      } : prev)
    } catch { await load() }
    finally { setBusyId(null) }
  }

  const remove = async (id) => {
    if (!user) return
    setBusyId(id)
    try {
      await client.delete(`/api/notifications/${id}`)
      setData(prev => prev ? {
        ...prev,
        content: prev.content.filter(n => n.id !== id)
      } : prev)
    } catch { await load() }
    finally { setBusyId(null) }
  }

  return (
    <AppLayout maxWidth="max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Bell size={20} className="text-blue-400" /> Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2 py-0.5 bg-blue-600 rounded-full font-medium">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up ✨"}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={load}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition"
            title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button onClick={markAll}
            disabled={!data?.content?.some(n => !n.read) || busyId === 'ALL'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-40">
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition capitalize ${
              filter === f
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-white'
            }`}>
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Bell size={20} className="text-blue-400" />
          </div>
          <p className="text-white font-medium mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-gray-600 text-sm">
            When people like or follow you, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <NotificationRow
              key={n.id}
              n={n}
              onRead={() => markRead(n.id)}
              onDelete={() => remove(n.id)}
              busy={busyId === n.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && data?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
          <span className="text-gray-500 text-sm">
            Page {page + 1} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button disabled={data.first} onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white disabled:opacity-40 transition text-sm">
              ← Prev
            </button>
            <button disabled={data.last} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white disabled:opacity-40 transition text-sm">
              Next →
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}