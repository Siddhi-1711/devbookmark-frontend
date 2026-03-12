import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ExplorePage from './pages/ExplorePage'
import ResourcePage from './pages/ResourcePage'
import ProfilePage from './pages/ProfilePage'
import CreateResourcePage from './pages/CreateResourcePage'
import EditResourcePage from './pages/EditResourcePage'
import BookmarksPage from "./pages/BookmarksPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from './pages/SearchPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import CollectionsPage from './pages/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import ReadingListPage from './pages/ReadingListPage'
import SeriesPage from './pages/SeriesPage'
import SeriesDetailPage from './pages/SeriesDetailPage'
import PeoplePage from './pages/PeoplePage'
import LandingPage from './pages/LandingPage'
import PublicationPage from './pages/PublicationPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  return (
    <Routes>
<Route path="/" element={<LandingPage />} />

      <Route path="/login" element={
        <GuestRoute><LoginPage /></GuestRoute>
      } />

      <Route path="/register" element={
        <GuestRoute><RegisterPage /></GuestRoute>
      } />

      <Route path="/feed" element={
        <ProtectedRoute><FeedPage /></ProtectedRoute>
      } />
      <Route path="/resources/:id" element={<ResourcePage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/users/:userId" element={<ProfilePage />} />
<Route path="/create" element={<ProtectedRoute><CreateResourcePage /></ProtectedRoute>} />
<Route path="/search" element={<SearchPage />} />
      <Route path="/explore" element={<ExplorePage />} />
<Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
<Route path="/resources/:id/edit" element={<ProtectedRoute><EditResourcePage /></ProtectedRoute>} />
<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
<Route path="/admin" element={<AdminPage />} />
<Route path="*" element={<NotFoundPage />} />

<Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
<Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
<Route path="/reading-list" element={<ProtectedRoute><ReadingListPage /></ProtectedRoute>} />
<Route path="/series" element={<ProtectedRoute><SeriesPage /></ProtectedRoute>} />
<Route path="/series/:slug" element={<SeriesDetailPage />} />
<Route path="/people" element={<PeoplePage />} />
<Route path="/p/:slug" element={<PublicationPage />} />
    </Routes>
  )
}