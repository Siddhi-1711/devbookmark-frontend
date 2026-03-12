import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import ResourceCard from '../components/ResourceCard'
import { BookOpen, Users, Calendar, ExternalLink, Edit, X } from 'lucide-react'

export default function PublicationPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [pub, setPub] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [modal, setModal] = useState(null) // 'followers'
  const [modalUsers, setModalUsers] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => { fetchPublication() }, [slug])

  const fetchPublication = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/publications/${slug}`)
      setPub(res.data)

      const postsRes = await client.get(`/api/profile/${res.data.ownerId}/resources`)
      const writtenPosts = (postsRes.data || []).filter(r => r.type === 'WRITTEN_POST')
      setPosts(writtenPosts)

      if (user && user.id !== res.data.ownerId) {
        try {
          const profileRes = await client.get(`/api/profile/${res.data.ownerId}`)
          setIsFollowing(profileRes.data.followedByMe)
        } catch {}
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFollow = async () => {
    if (!user) return navigate('/login')
    try {
      if (isFollowing) {
        await client.delete(`/api/users/${pub.ownerId}/follow`)
      } else {
        await client.post(`/api/users/${pub.ownerId}/follow`)
      }
      setIsFollowing(!isFollowing)
      setPub(prev => ({
        ...prev,
        followerCount: prev.followerCount + (isFollowing ? -1 : 1)
      }))
    } catch (err) { console.error(err) }
  }

  const openFollowers = async () => {
    setModal('followers')
    setModalLoading(true)
    setModalUsers([])
    try {
      const res = await client.get(`/api/users/${pub.ownerId}/followers`)
      setModalUsers(res.data.content || [])
    } catch (err) { console.error(err) }
    finally { setModalLoading(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 animate-pulse space-y-6">
        <div className="h-40 bg-gray-800 rounded-2xl" />
        <div className="h-8 bg-gray-800 rounded w-1/2" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-800 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  if (!pub) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Publication not found</div>
    </div>
  )

  const isOwner = user?.id === pub.ownerId

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-20">

        {/* Publication Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">

          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-blue-600/5" />

          <div className="px-6 pb-6">
            {/* Logo + actions */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-gray-900 overflow-hidden bg-gray-800 shrink-0">
                {pub.logoUrl ? (
                  <img src={pub.logoUrl} alt={pub.name}
                    className="w-full h-full object-cover"
                    onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-blue-600">
                    {pub.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-2">
                {isOwner ? (
                  <button onClick={() => navigate('/settings?tab=publication')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                    <Edit size={14} /> Edit Publication
                  </button>
                ) : user && (
                  <button onClick={toggleFollow}
                    className={`flex items-center gap-2 px-5 py-2 text-sm rounded-lg transition font-medium ${
                      isFollowing
                        ? 'bg-gray-800 hover:bg-red-900/30 hover:text-red-400 text-white border border-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Name + bio */}
            <h1 className="text-white text-2xl font-bold mb-1">{pub.name}</h1>
            {pub.bio && <p className="text-gray-400 text-sm mb-4 leading-relaxed">{pub.bio}</p>}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <button onClick={openFollowers}
                className="flex items-center gap-1.5 hover:text-white transition">
                <Users size={14} />
                <strong className="text-white">{pub.followerCount}</strong> followers
              </button>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                <strong className="text-white">{posts.length}</strong> posts
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Since {new Date(pub.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Link to={`/users/${pub.ownerId}`}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition">
                <ExternalLink size={13} /> View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">
            Posts <span className="text-gray-600 font-normal text-sm">({posts.length})</span>
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
              <BookOpen size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No posts published yet</p>
              {isOwner && (
                <Link to="/create"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block transition">
                  + Write your first post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <ResourceCard key={post.id} resource={post} />)}
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
          onClick={() => setModal(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-5 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Followers</h3>
              <button onClick={() => setModal(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : modalUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No followers yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {modalUsers.map(u => (
                  <Link key={u.id} to={`/users/${u.id}`}
                    onClick={() => setModal(null)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition border border-transparent hover:border-gray-700">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-sm">{u.name}</div>
                      <div className="text-xs text-gray-500">View profile</div>
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