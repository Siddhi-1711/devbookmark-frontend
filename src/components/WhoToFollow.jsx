import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import { UserPlus, Users } from 'lucide-react'

export default function WhoToFollow() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [following, setFollowing] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

const fetchSuggestions = async () => {
  setLoading(true)
  try {
    // fetch suggestions
    let res = await client.get('/api/suggestions/users?limit=6')
    let users = res.data || []
    if (users.length === 0) {
      res = await client.get('/api/suggestions/users/trending?limit=6')
      users = res.data || []
    }
    users = users.filter(u => u.id !== user?.id).slice(0, 4)
    setSuggestions(users)

    // fetch who I already follow to initialize following state correctly
    const followingRes = await client.get('/api/users/me/following?size=100')
    const followingIds = (followingRes.data.content || []).map(u => u.id)
    setFollowing(new Set(followingIds))
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const toggleFollow = async (userId) => {
    const wasFollowing = following.has(userId)

    // optimistic UI - update following set AND follower count
    setFollowing(prev => {
      const next = new Set(prev)
      wasFollowing ? next.delete(userId) : next.add(userId)
      return next
    })
    setSuggestions(prev => prev.map(u =>
      u.id === userId
        ? { ...u, followerCount: u.followerCount + (wasFollowing ? -1 : 1) }
        : u
    ))

    try {
      if (wasFollowing) await client.delete(`/api/users/${userId}/follow`)
      else await client.post(`/api/users/${userId}/follow`)
    } catch (err) {
      console.error(err)
      // rollback both
      setFollowing(prev => {
        const next = new Set(prev)
        wasFollowing ? next.add(userId) : next.delete(userId)
        return next
      })
      setSuggestions(prev => prev.map(u =>
        u.id === userId
          ? { ...u, followerCount: u.followerCount + (wasFollowing ? 1 : -1) }
          : u
      ))
    }
  }

  if (!user || loading || suggestions.length === 0) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <Users size={15} className="text-blue-400" />
        Who to Follow
      </h3>

      <div className="space-y-3">
        {suggestions.map(u => (
          <div key={u.id} className="flex items-center justify-between gap-3">
            <Link to={`/users/${u.id}`} className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-gray-300 text-sm hover:text-white transition truncate block">
                  {u.name}
                </span>
                <span className="text-gray-600 text-xs">{u.followerCount ?? 0} followers</span>
              </div>
            </Link>

            <button
              onClick={() => toggleFollow(u.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition shrink-0 ${
                following.has(u.id)
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30'
              }`}
            >
              {following.has(u.id) ? 'Following' : (
                <><UserPlus size={11} /> Follow</>
              )}
            </button>
          </div>
        ))}
      </div>


      <Link to="/people" className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-4 transition">
        See all people →
      </Link>
    </div>
  )
}