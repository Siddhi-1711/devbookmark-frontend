import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * React Error Boundary — catches any render errors in children
 * and shows a friendly fallback instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production you could send this to an error tracking service
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback was passed as a prop, use it
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-400" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight card-level boundary — shows a small inline error
 * instead of taking down the whole page when one card fails.
 */
export function CardErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-5 text-center">
          <p className="text-gray-500 text-sm">Failed to load this item.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}