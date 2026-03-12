import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import ResourceCard from '../components/ResourceCard'

import { Pin, X, UserPlus, UserCheck, Settings, Grid, List, BookOpen } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
export default function ProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const targetId = userId || user?.id

  const [profile, setProfile] = useState(null)
  usePageTitle(profile?.name)
  const [resources, setResources] = useState([])
  const [pinned, setPinned] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [modalUsers, setModalUsers] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'grid'

  const isMe = user?.id === targetId

  useEffect(() => {
    if (targetId) {
      fetchProfile()
      fetchResources()
      fetchPinned()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId])

  const initials = useMemo(() => {
    const name = profile?.name?.trim() || ''
    if (!name) return '?'
    const parts = name.split(/\s+/)
    const first = parts[0]?.[0] || ''
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
    return (first + second).toUpperCase()
  }, [profile?.name])

  const fetchProfile = async () => {
    try {
      const res = await client.get(`/api/profile/${targetId}`)
      setProfile(res.data)
      setIsFollowing(res.data.followedByMe)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    try {
      const res = await client.get(`/api/profile/${targetId}/resources`)
      setResources(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPinned = async () => {
    try {
      const res = await client.get(`/api/pins/users/${targetId}`)
      setPinned(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const openModal = async (type) => {
    setModal(type)
    setModalLoading(true)
    setModalUsers([])
    try {
      const res = await client.get(`/api/users/${targetId}/${type}`)
      setModalUsers(res.data.content || [])
    } catch (err) {
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const toggleFollow = async () => {
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await client.delete(`/api/users/${targetId}/follow`)
      } else {
        await client.post(`/api/users/${targetId}/follow`)
      }
      setIsFollowing(!isFollowing)
      fetchProfile()
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-gray-800 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-7 bg-gray-800 rounded w-52" />
                  <div className="flex gap-2">
                    <div className="h-9 bg-gray-800 rounded-xl w-28" />
                    <div className="h-9 bg-gray-800 rounded-xl w-28" />
                    <div className="h-9 bg-gray-800 rounded-xl w-28" />
                  </div>
                </div>
              </div>
              <div className="h-10 w-36 bg-gray-800 rounded-xl" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-5 w-64 bg-gray-800 rounded mb-2" />
                <div className="h-4 w-full bg-gray-800 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const visibleResources = resources.filter(r => r.visibility !== 'PRIVATE' || isMe)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        {/* Profile Header */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl shrink-0 ring-1 ring-blue-500/30 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-white text-2xl font-bold leading-tight truncate">
                  {profile?.name}
                </h1>
                {profile?.username && (
                  <p className="text-gray-500 text-sm mt-0.5">@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats row as chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal('followers')}
                    className="px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-xl text-sm transition"
                  >
                    <span className="text-white font-semibold">{profile?.followers}</span>{' '}
                    <span className="text-gray-400">followers</span>
                  </button>

                  <button
                    onClick={() => openModal('following')}
                    className="px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-xl text-sm transition"
                  >
                    <span className="text-white font-semibold">{profile?.following}</span>{' '}
                    <span className="text-gray-400">following</span>
                  </button>

                  <div className="px-3 py-2 bg-gray-800/30 border border-gray-800 rounded-xl text-sm">
                    <span className="text-white font-semibold">{profile?.resources}</span>{' '}
                    <span className="text-gray-400">resources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {isMe ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition border border-gray-700/60"
                >
                  <Settings size={15} /> Edit Profile
                </button>
              ) : user ? (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-5 py-2 text-sm rounded-xl transition font-medium border ${
                    isFollowing
                      ? 'bg-gray-800 hover:bg-red-900/30 hover:text-red-300 border-gray-700/60 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 border-blue-500/40 text-white'
                  } ${followLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isFollowing ? (
                    <><UserCheck size={15} /> {followLoading ? '...' : 'Following'}</>
                  ) : (
                    <><UserPlus size={15} /> {followLoading ? '...' : 'Follow'}</>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2 text-sm rounded-xl transition font-medium border bg-blue-600 hover:bg-blue-700 border-blue-500/40 text-white"
                >
                  <UserPlus size={15} /> Login to follow
                </button>
              )}

              {/* Publication button — always show if exists */}
              {profile?.publicationSlug && (
                <Link
                  to={`/p/${profile.publicationSlug}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition border border-gray-700/60"
                >
                  <BookOpen size={15} /> Publication
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
                <Pin size={14} className="text-blue-400" /> Pinned
              </h2>
              <span className="text-xs text-gray-500">{pinned.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pinned.map(r => (
                <Link
                  to={`/resources/${r.id}`}
                  key={r.id}
                  className="bg-gray-900/80 border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/45 hover:bg-gray-900 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 px-2 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-300 text-xs">
                      Pinned
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-white font-medium text-sm group-hover:text-blue-400 transition truncate">
                        {r.title}
                      </h3>
                      {r.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resources header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Resources</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {visibleResources.length} visible
            </p>
          </div>

          {/* Segmented control */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                view === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title="List view"
            >
              <List size={14} />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                view === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title="Grid view"
            >
              <Grid size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Resources */}
        {visibleResources.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-200 font-medium text-lg">No resources yet</p>
            <p className="text-gray-500 text-sm mt-1">
              {isMe ? 'Save or create your first resource to see it here.' : 'This user hasn’t posted anything yet.'}
            </p>
            {isMe && (
              <Link
                to="/create"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition border border-blue-500/40"
              >
                + Create your first resource
              </Link>
            )}
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
            {visibleResources.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold capitalize">{modal}</h3>
              <button
                onClick={() => setModal(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : modalUsers.length === 0 ? (
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-sm">No users found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {modalUsers.map(u => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`}
                    onClick={() => setModal(null)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition border border-transparent hover:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-1 ring-blue-500/30">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm truncate">{u.name}</div>
                      <div className="text-xs text-gray-500 truncate">View profile</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}