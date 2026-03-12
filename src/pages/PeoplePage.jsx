import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import { Users, UserPlus, TrendingUp } from 'lucide-react'

export default function PeoplePage() {
  const { user } = useAuth()
  const [trending, setTrending] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [following, setFollowing] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [trendRes, sugRes] = await Promise.all([
        client.get('/api/suggestions/users/trending?limit=20'),
        user ? client.get('/api/suggestions/users?limit=10') : Promise.resolve({ data: [] })
      ])

      setTrending(trendRes.data.filter(u => u.id !== user?.id))
      setSuggestions(sugRes.data.filter(u => u.id !== user?.id))

      if (user) {
        const followingRes = await client.get('/api/users/me/following?size=100')
        const ids = (followingRes.data.content || []).map(u => u.id)
        setFollowing(new Set(ids))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFollow = async (userId) => {
    const wasFollowing = following.has(userId)

    setFollowing(prev => {
      const next = new Set(prev)
      wasFollowing ? next.delete(userId) : next.add(userId)
      return next
    })
    // update count in both lists
    const updateCount = (list) => list.map(u =>
      u.id === userId
        ? { ...u, followerCount: u.followerCount + (wasFollowing ? -1 : 1) }
        : u
    )
    setTrending(prev => updateCount(prev))
    setSuggestions(prev => updateCount(prev))

    try {
      if (wasFollowing) await client.delete(`/api/users/${userId}/follow`)
      else await client.post(`/api/users/${userId}/follow`)
    } catch (err) {
      // rollback
      setFollowing(prev => {
        const next = new Set(prev)
        wasFollowing ? next.add(userId) : next.delete(userId)
        return next
      })
      const rollback = (list) => list.map(u =>
        u.id === userId
          ? { ...u, followerCount: u.followerCount + (wasFollowing ? 1 : -1) }
          : u
      )
      setTrending(prev => rollback(prev))
      setSuggestions(prev => rollback(prev))
    }
  }

  const UserCard = ({ u }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition flex items-center justify-between gap-3">
      <Link to={`/users/${u.id}`} className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
          {u.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{u.name}</p>
          <p className="text-gray-500 text-xs">{u.followerCount ?? 0} followers</p>
        </div>
      </Link>
      {user && user.id !== u.id && (
        <button
          onClick={() => toggleFollow(u.id)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition shrink-0 ${
            following.has(u.id)
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30'
          }`}
        >
          {following.has(u.id) ? 'Following' : <><UserPlus size={11} /> Follow</>}
        </button>
      )}
    </div>
  )

  return (
    <AppLayout maxWidth="max-w-4xl">
      <h1 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
        <Users size={22} className="text-blue-400" /> People
      </h1>
      <p className="text-gray-400 text-sm mb-8">Discover creators and developers to follow</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Suggested for you */}
          {suggestions.length > 0 && (
            <section>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <UserPlus size={16} className="text-blue-400" /> Suggested for You
                <span className="text-gray-600 text-xs font-normal">Based on who you follow</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map(u => <UserCard key={u.id} u={u} />)}
              </div>
            </section>
          )}

          {/* Trending creators */}
          <section>
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> All Creators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trending.map(u => <UserCard key={u.id} u={u} />)}
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  )
}