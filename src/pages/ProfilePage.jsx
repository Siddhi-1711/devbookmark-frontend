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
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-5">
          <div className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/70 p-5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 rounded-2xl bg-gray-800" />
                <div className="min-w-0 space-y-3">
                  <div className="h-7 w-40 rounded bg-gray-800 sm:w-52" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-9 w-24 rounded-xl bg-gray-800 sm:w-28" />
                    <div className="h-9 w-24 rounded-xl bg-gray-800 sm:w-28" />
                    <div className="h-9 w-24 rounded-xl bg-gray-800 sm:w-28" />
                  </div>
                </div>
              </div>
              <div className="h-10 w-full rounded-xl bg-gray-800 md:w-36" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/70 p-4 sm:p-5"
              >
                <div className="mb-2 h-5 w-48 rounded bg-gray-800 sm:w-64" />
                <div className="mb-2 h-4 w-full rounded bg-gray-800" />
                <div className="h-4 w-5/6 rounded bg-gray-800" />
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

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-5">
        {/* Profile Header */}
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            {/* Left */}
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-blue-500/30">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="break-words text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {profile?.name}
                </h1>

                {profile?.username && (
                  <p className="mt-0.5 break-all text-sm text-gray-500">
                    @{profile.username}
                  </p>
                )}

                {profile?.bio && (
                  <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-gray-400">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal('followers')}
                    className="rounded-xl border border-gray-700/50 bg-gray-800/60 px-3 py-2 text-sm transition hover:bg-gray-800"
                  >
                    <span className="font-semibold text-white">{profile?.followers}</span>{' '}
                    <span className="text-gray-400">followers</span>
                  </button>

                  <button
                    onClick={() => openModal('following')}
                    className="rounded-xl border border-gray-700/50 bg-gray-800/60 px-3 py-2 text-sm transition hover:bg-gray-800"
                  >
                    <span className="font-semibold text-white">{profile?.following}</span>{' '}
                    <span className="text-gray-400">following</span>
                  </button>

                  <div className="rounded-xl border border-gray-800 bg-gray-800/30 px-3 py-2 text-sm">
                    <span className="font-semibold text-white">{profile?.resources}</span>{' '}
                    <span className="text-gray-400">resources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              {isMe ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700/60 bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-700 sm:w-auto"
                >
                  <Settings size={15} />
                  Edit Profile
                </button>
              ) : user ? (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2 text-sm font-medium transition sm:w-auto ${
                    isFollowing
                      ? 'border-gray-700/60 bg-gray-800 text-white hover:bg-red-900/30 hover:text-red-300'
                      : 'border-blue-500/40 bg-blue-600 text-white hover:bg-blue-700'
                  } ${followLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={15} />
                      {followLoading ? '...' : 'Following'}
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      {followLoading ? '...' : 'Follow'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  <UserPlus size={15} />
                  Login to follow
                </button>
              )}

              {profile?.publicationSlug && (
                <Link
                  to={`/p/${profile.publicationSlug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700/60 bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-700 sm:w-auto"
                >
                  <BookOpen size={15} />
                  Publication
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Pin size={14} className="text-blue-400" />
                Pinned
              </h2>
              <span className="text-xs text-gray-500">{pinned.length} items</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pinned.map(r => (
                <Link
                  to={`/resources/${r.id}`}
                  key={r.id}
                  className="group rounded-2xl border border-blue-500/20 bg-gray-900/80 p-4 transition hover:border-blue-500/45 hover:bg-gray-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-lg border border-blue-500/20 bg-blue-600/10 px-2 py-1 text-xs text-blue-300">
                      Pinned
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-medium text-white transition group-hover:text-blue-400">
                        {r.title}
                      </h3>
                      {r.description && (
                        <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-gray-500">
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Resources</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {visibleResources.length} visible
            </p>
          </div>

          <div className="flex w-full items-center rounded-xl border border-gray-800 bg-gray-900 p-1 sm:w-auto">
            <button
              onClick={() => setView('list')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition sm:flex-none ${
                view === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title="List view"
            >
              <List size={14} />
              <span>List</span>
            </button>

            <button
              onClick={() => setView('grid')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition sm:flex-none ${
                view === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title="Grid view"
            >
              <Grid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Resources */}
        {visibleResources.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center sm:p-10">
            <p className="text-lg font-medium text-gray-200">No resources yet</p>
            <p className="mt-1 text-sm text-gray-500">
              {isMe
                ? 'Save or create your first resource to see it here.'
                : 'This user hasn’t posted anything yet.'}
            </p>
            {isMe && (
              <Link
                to="/create"
                className="mt-4 inline-block rounded-xl border border-blue-500/40 bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
              >
                + Create your first resource
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                : 'space-y-4'
            }
          >
            {visibleResources.map(r => (
              <div key={r.id} className="min-w-0">
                <ResourceCard resource={r} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-0 pt-6 backdrop-blur-[2px] sm:items-center sm:px-4"
          onClick={() => setModal(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-t-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl sm:rounded-2xl sm:p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="capitalize font-semibold text-white">{modal}</h3>
              <button
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-800" />
                ))}
              </div>
            ) : modalUsers.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-sm text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {modalUsers.map(u => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`}
                    onClick={() => setModal(null)}
                    className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-gray-700 hover:bg-gray-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white ring-1 ring-blue-500/30">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white">{u.name}</div>
                      <div className="truncate text-xs text-gray-500">View profile</div>
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