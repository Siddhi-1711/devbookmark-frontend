import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import { usePageTitle } from '../hooks/usePageTitle'

import {
  Shield, Users, FileText, Ban, CheckCircle,
  Trash2, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'
// ─── Guard ────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/feed" replace />
  return <AdminDashboard />
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard() {
  usePageTitle('Admin Panel')
  const [tab, setTab] = useState('users')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    client.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Shield size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Manage users and content</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
            <StatCard label="Banned Users" value={stats.bannedUsers} icon={Ban} color="red" />
            <StatCard label="Total Resources" value={stats.totalResources} icon={FileText} color="green" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['users', 'resources'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border capitalize ${
                tab === t
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'users'     && <UsersTab />}
        {tab === 'resources' && <ResourcesTab />}
      </div>
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue:  { bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  text: 'text-blue-400'  },
    red:   { bg: 'bg-red-500/10',   border: 'border-red-500/20',   text: 'text-red-400'   },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
  }
  const c = colors[color]
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className={c.text} />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-white text-2xl font-bold">{value?.toLocaleString()}</p>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [busy, setBusy]       = useState(null) // userId being actioned

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await client.get(`/api/admin/users?page=${p}&size=20`)
      setUsers(res.data.content || [])
      setTotalPages(res.data.totalPages || 1)
      setPage(p)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(0) }, [])

  const action = async (userId, endpoint) => {
    setBusy(userId)
    try {
      await client.post(`/api/admin/users/${userId}/${endpoint}`)
      load(page)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally { setBusy(null) }
  }

  const banWithReason = async (userId) => {
    const reason = window.prompt('Ban reason (optional):')
    if (reason === null) return // cancelled
    setBusy(userId)
    try {
      await client.post(`/api/admin/users/${userId}/ban`, { reason })
      load(page)
    } catch (err) {
      alert(err.response?.data?.message || 'Ban failed')
    } finally { setBusy(null) }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition">
                <td className="px-4 py-3">
                  <div>
                    <Link to={`/users/${u.id}`}
                      className="text-white font-medium hover:text-blue-400 transition">
                      {u.name}
                    </Link>
                    {u.username && (
                      <p className="text-gray-500 text-xs">@{u.username}</p>
                    )}
                    <p className="text-gray-600 text-xs">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                    u.role === 'ADMIN'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.banned ? (
                    <div>
                      <span className="px-2 py-1 rounded-lg text-xs bg-red-500/15 text-red-300 border border-red-500/25">
                        Banned
                      </span>
                      {u.banReason && (
                        <p className="text-gray-600 text-xs mt-1 max-w-[180px] truncate" title={u.banReason}>
                          {u.banReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-1 rounded-lg text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {u.banned ? (
                      <ActionBtn
                        onClick={() => action(u.id, 'unban')}
                        disabled={busy === u.id}
                        icon={<CheckCircle size={13} />}
                        label="Unban"
                        color="green"
                      />
                    ) : (
                      <ActionBtn
                        onClick={() => banWithReason(u.id)}
                        disabled={busy === u.id}
                        icon={<Ban size={13} />}
                        label="Ban"
                        color="red"
                      />
                    )}
                    {u.role === 'ADMIN' ? (
                      <ActionBtn
                        onClick={() => action(u.id, 'demote')}
                        disabled={busy === u.id}
                        icon={<AlertTriangle size={13} />}
                        label="Demote"
                        color="amber"
                      />
                    ) : (
                      <ActionBtn
                        onClick={() => action(u.id, 'promote')}
                        disabled={busy === u.id}
                        icon={<Shield size={13} />}
                        label="Promote"
                        color="amber"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={load} />
    </div>
  )
}

// ─── Resources Tab ────────────────────────────────────────────────────────────
function ResourcesTab() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting]   = useState(null)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await client.get(`/api/admin/resources?page=${p}&size=20`)
      setResources(res.data.content || [])
      setTotalPages(res.data.totalPages || 1)
      setPage(p)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(0) }, [])

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) return
    setDeleting(id)
    try {
      await client.delete(`/api/admin/resources/${id}`)
      setResources(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(null) }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Visibility</th>
              <th className="px-4 py-3 text-left">Posted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 max-w-[220px]">
                  <Link to={`/resources/${r.id}`}
                    className="text-white hover:text-blue-400 transition line-clamp-2 font-medium">
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/users/${r.ownerId}`}
                    className="text-gray-400 hover:text-white transition text-xs">
                    {r.ownerName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs border border-gray-700">
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs border ${
                    r.visibility === 'PUBLIC'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-gray-800 text-gray-500 border-gray-700'
                  }`}>
                    {r.visibility}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionBtn
                    onClick={() => deleteResource(r.id)}
                    disabled={deleting === r.id}
                    icon={<Trash2 size={13} />}
                    label={deleting === r.id ? '...' : 'Delete'}
                    color="red"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={load} />
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, icon, label, color }) {
  const colors = {
    red:   'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
    green: 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition
        disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {icon} {label}
    </button>
  )
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-gray-400 text-sm">
        Page <span className="text-white font-medium">{page + 1}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-800 rounded-xl" />
      ))}
    </div>
  )
}