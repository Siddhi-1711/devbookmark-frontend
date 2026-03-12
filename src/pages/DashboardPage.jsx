import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { Heart, Bookmark, Eye, MessageCircle, Users, TrendingUp, FileText, Globe } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await client.get('/api/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <AppLayout maxWidth="max-w-5xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout maxWidth="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, {data?.name}</p>
      </div>

      {/* This Week highlights */}
      <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" /> This Week
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{data?.newViewsThisWeek}</p>
            <p className="text-gray-400 text-sm mt-1">Views</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{data?.newLikesThisWeek}</p>
            <p className="text-gray-400 text-sm mt-1">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{data?.newFollowersThisWeek}</p>
            <p className="text-gray-400 text-sm mt-1">New Followers</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Eye size={18} className="text-blue-400" />} label="Total Views" value={data?.totalViews} />
        <StatCard icon={<Heart size={18} className="text-red-400" />} label="Total Likes" value={data?.totalLikes} />
        <StatCard icon={<Bookmark size={18} className="text-yellow-400" />} label="Total Saves" value={data?.totalSaves} />
        <StatCard icon={<MessageCircle size={18} className="text-green-400" />} label="Comments" value={data?.totalComments} />
        <StatCard icon={<Users size={18} className="text-purple-400" />} label="Followers" value={data?.followers} />
        <StatCard icon={<Users size={18} className="text-gray-400" />} label="Following" value={data?.following} />
        <StatCard icon={<Globe size={18} className="text-blue-400" />} label="Published" value={data?.publishedPosts} />
        <StatCard icon={<FileText size={18} className="text-gray-400" />} label="Drafts" value={data?.draftPosts} />
      </div>

      {/* Top Resources */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Top Resources</h2>
        <div className="space-y-3">
          {data?.topPosts?.map((post, i) => (
            <Link
              key={post.id}
              to={`/resources/${post.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <span className="text-gray-600 text-sm w-5 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{post.title}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
                <span className="flex items-center gap-1"><Bookmark size={12} /> {post.saves}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <p className="text-white text-2xl font-bold">{value ?? 0}</p>
    </div>
  )
}