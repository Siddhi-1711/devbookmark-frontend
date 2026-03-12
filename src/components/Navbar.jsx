import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import {
  LogOut, Compass, Home, Bookmark, Bell, User, Search,
  LayoutDashboard, FolderOpen, BookOpen, BookMarked,
  ChevronDown, Users, Menu, X, Plus, Shield
} from 'lucide-react'
import { useEffect, useState, useRef } from "react"
import client from "../api/client"

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const moreRef = useRef(null)

  const handleLogout = () => {
    logoutUser()
    setShowMobile(false)
    navigate('/explore')
  }

  const loadUnread = async () => {
    if (!user) return
    try {
      const res = await client.get("/api/notifications/unread-count")
      setUnread(res.data || 0)
    } catch {}
  }

  useEffect(() => {
    loadUnread()
    const i = setInterval(loadUnread, 30000)
    return () => clearInterval(i)
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setShowMobile(false) }, [navigate])

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
      isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`

  const dropdownLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 text-sm transition w-full ${
      isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition text-base ${
      isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          <NavLink to="/" className="text-xl font-bold text-white shrink-0">
            dev<span className="text-blue-500">bookmark</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" className={linkClass}>
              <Compass size={16} /> Explore
            </NavLink>
            <NavLink to="/search" className={linkClass}>
              <Search size={16} /> Search
            </NavLink>

            {user && (
              <>
                <NavLink to="/feed" className={linkClass}>
                  <Home size={16} /> Feed
                </NavLink>
                <NavLink to="/bookmarks" className={linkClass}>
                  <Bookmark size={16} /> Saved
                </NavLink>
                <NavLink to="/notifications" className={linkClass}>
                  <div className="relative flex items-center gap-2">
                    <Bell size={16} />
                    {unread > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                    Notifications
                  </div>
                </NavLink>

                {/* More dropdown */}
                <div className="relative" ref={moreRef}>
                  <button onClick={() => setShowMore(v => !v)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition text-sm ${
                      showMore ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}>
                    More <ChevronDown size={14} className={`transition ${showMore ? 'rotate-180' : ''}`} />
                  </button>

                  {showMore && (
                    <div className="absolute top-12 right-0 bg-gray-900 border border-gray-800 rounded-xl shadow-xl w-48 overflow-hidden z-50"
                      onClick={() => setShowMore(false)}>
                      <NavLink to="/dashboard" className={dropdownLinkClass}><LayoutDashboard size={15} /> Dashboard</NavLink>
                      <NavLink to="/collections" className={dropdownLinkClass}><FolderOpen size={15} /> Collections</NavLink>
                      <NavLink to="/reading-list" className={dropdownLinkClass}><BookOpen size={15} /> Reading List</NavLink>
                      <NavLink to="/series" className={dropdownLinkClass}><BookMarked size={15} /> Series</NavLink>
                      <NavLink to="/people" className={dropdownLinkClass}><Users size={15} /> People</NavLink>
                      <div className="border-t border-gray-800" />
                      <NavLink to="/settings" className={dropdownLinkClass}><User size={15} /> Settings</NavLink>
                      {isAdmin && (
                        <NavLink to="/admin" className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2.5 text-sm transition w-full ${
                            isActive ? 'text-amber-300 bg-amber-500/10' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                          }`}>
                          <Shield size={15} /> Admin Panel
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>

                <NavLink to="/create"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm">
                  + New
                </NavLink>

                <NavLink to="/profile" className={linkClass}>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name}
                </NavLink>

                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition text-sm">
                  <LogOut size={16} />
                </button>
              </>
            )}

            {!user && (
              <>
                <NavLink to="/login" className={({ isActive }) =>
                  isActive ? 'px-3 py-2 text-white text-sm' : 'px-3 py-2 text-gray-400 hover:text-white text-sm'}>
                  Sign in
                </NavLink>
                <NavLink to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                  Sign up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <NavLink to="/create"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm">
                <Plus size={15} /> New
              </NavLink>
            )}
            <button onClick={() => setShowMobile(v => !v)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              {showMobile ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {showMobile && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobile(false)} />

          {/* Drawer */}
          <div className="absolute top-14 left-0 right-0 bg-gray-950 border-b border-gray-800 p-4 space-y-1 max-h-[85vh] overflow-y-auto">

            {user && (
              /* User info */
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-900 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-500 text-xs">View profile</p>
                </div>
              </div>
            )}

            <NavLink to="/explore" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
              <Compass size={20} /> Explore
            </NavLink>
            <NavLink to="/search" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
              <Search size={20} /> Search
            </NavLink>
            <NavLink to="/people" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
              <Users size={20} /> People
            </NavLink>

            {user ? (
              <>
                <div className="border-t border-gray-800 my-2" />
                <NavLink to="/feed" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <Home size={20} /> Feed
                </NavLink>
                <NavLink to="/notifications" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <div className="relative">
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  Notifications
                  {unread > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{unread}</span>
                  )}
                </NavLink>
                <NavLink to="/bookmarks" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <Bookmark size={20} /> Saved
                </NavLink>

                <div className="border-t border-gray-800 my-2" />
                <NavLink to="/collections" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <FolderOpen size={20} /> Collections
                </NavLink>
                <NavLink to="/reading-list" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <BookOpen size={20} /> Reading List
                </NavLink>
                <NavLink to="/series" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <BookMarked size={20} /> Series
                </NavLink>
                <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <LayoutDashboard size={20} /> Dashboard
                </NavLink>

                <div className="border-t border-gray-800 my-2" />
                <NavLink to="/profile" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <User size={20} /> Profile
                </NavLink>
                <NavLink to="/settings" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  <User size={20} /> Settings
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin"
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition text-base ${
                      isActive ? 'bg-amber-500/15 text-amber-300' : 'text-amber-400 hover:bg-amber-500/10'
                    }`}
                    onClick={() => setShowMobile(false)}>
                    <Shield size={20} /> Admin Panel
                  </NavLink>
                )}

                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition text-base w-full text-red-400 hover:bg-red-400/10">
                  <LogOut size={20} /> Sign out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-800 my-2" />
                <NavLink to="/login" className={mobileLinkClass} onClick={() => setShowMobile(false)}>
                  Sign in
                </NavLink>
                <NavLink to="/register" onClick={() => setShowMobile(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-base font-medium">
                  Get Started Free
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}