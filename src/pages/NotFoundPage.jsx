import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-8xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/explore"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Go to Explore
        </Link>
      </div>
    </div>
  )
}