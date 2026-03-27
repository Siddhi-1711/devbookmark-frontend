import { Link } from 'react-router-dom'
import { Compass, BookOpen, FolderOpen, Users, BookMarked, TrendingUp, Star, Zap, Globe, Code, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <span className="text-lg sm:text-xl font-bold shrink-0">
            dev<span className="text-blue-500">bookmark</span>
          </span>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/explore"
              className="hidden sm:block text-gray-400 hover:text-white text-sm transition"
            >
              Explore
            </Link>
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm transition px-2 sm:px-3 py-2 whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/15 border border-blue-600/30 rounded-full text-blue-400 text-xs mb-6">
            <Zap size={12} /> The developer knowledge platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-5 sm:mb-6 leading-tight">
            Discover. Save.
            <br />
            <span className="text-blue-500">Share Knowledge.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            devbookmark is where developers curate resources, write posts, build collections and follow creators — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-base sm:text-lg"
            >
              Start for free <ArrowRight size={18} />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-medium rounded-xl transition"
            >
              <Compass size={18} /> Browse Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Everything a developer needs
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              More than bookmarks — a full knowledge platform built for developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: <Compass size={22} className="text-blue-400" />,
                title: 'Explore & Discover',
                desc: 'Browse latest, trending and popular resources. Filter by tags to find exactly what you need.',
              },
              {
                icon: <BookOpen size={22} className="text-green-400" />,
                title: 'Reading List',
                desc: 'Save resources to read later. Mark as read, filter by status, never lose a good link again.',
              },
              {
                icon: <FolderOpen size={22} className="text-yellow-400" />,
                title: 'Collections',
                desc: 'Organize resources into public or private collections. Share curated lists with the world.',
              },
              {
                icon: <BookMarked size={22} className="text-purple-400" />,
                title: 'Series',
                desc: 'Create ordered learning paths. Group related resources into step-by-step series like a course.',
              },
              {
                icon: <Code size={22} className="text-pink-400" />,
                title: 'Write Posts',
                desc: 'Publish rich articles with a full editor. Bold, highlights, code blocks, headings and more.',
              },
              {
                icon: <Users size={22} className="text-orange-400" />,
                title: 'Follow Creators',
                desc: 'Follow developers you admire. Get a personalized feed of resources from people you trust.',
              },
              {
                icon: <TrendingUp size={22} className="text-blue-400" />,
                title: 'Creator Dashboard',
                desc: 'Track your views, likes, saves and followers. See which resources resonate most.',
              },
              {
                icon: <Star size={22} className="text-yellow-400" />,
                title: 'Save & Bookmark',
                desc: 'Save any resource to your personal bookmarks. Search and filter your saved collection.',
              },
              {
                icon: <Globe size={22} className="text-green-400" />,
                title: 'Public Profiles',
                desc: 'Showcase your knowledge. Pin your best resources, share your collections and articles.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6 hover:border-gray-700 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-gray-400 mb-10 sm:mb-16">Get started in seconds</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card required.' },
              { step: '02', title: 'Save resources', desc: 'Add links, write posts, create collections and reading lists.' },
              { step: '03', title: 'Share & grow', desc: 'Follow others, get followers, build your developer reputation.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 font-bold text-sm">{s.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-600/20 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to level up your<br />developer knowledge?
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
              Join thousands of developers already using devbookmark.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-base sm:text-lg"
            >
              Get started for free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold">
            dev<span className="text-blue-500">bookmark</span>
          </span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-500 text-sm">
            <Link to="/explore" className="hover:text-white transition">Explore</Link>
            <Link to="/people" className="hover:text-white transition">People</Link>
            <Link to="/login" className="hover:text-white transition">Sign in</Link>
            <Link to="/register" className="hover:text-white transition">Sign up</Link>
          </div>
          <p className="text-gray-600 text-sm">© 2026 devbookmark</p>
        </div>
      </footer>

    </div>
  )
}