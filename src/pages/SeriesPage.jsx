import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { BookMarked, Plus, Trash2, X, CheckCircle } from 'lucide-react'

export default function SeriesPage() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: '',
    coverImage: '',
    isComplete: false,
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/series/me')
      setSeries(res.data.content || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const autoSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm((f) => ({ ...f, title, slug: autoSlug(title) }))
  }

  const createSeries = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const res = await client.post('/api/series', form)
      setSeries((prev) => [res.data, ...prev])
      setShowCreate(false)
      setForm({
        title: '',
        description: '',
        slug: '',
        coverImage: '',
        isComplete: false,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create series')
    } finally {
      setCreating(false)
    }
  }

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this series?')) return

    try {
      await client.delete(`/api/series/${id}`)
      setSeries((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AppLayout maxWidth="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <BookMarked size={22} className="shrink-0 text-blue-400" />
            <span>Series</span>
          </h1>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-400">
            Group resources into ordered series
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto sm:px-5 sm:py-2.5"
        >
          <Plus size={16} />
          <span>New Series</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:px-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full rounded-t-2xl border border-gray-800 bg-gray-900 p-4 sm:max-w-md sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">
                New Series
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={createSeries} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                  placeholder="e.g. Spring Boot Mastery"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 font-mono text-sm text-white outline-none transition focus:border-blue-500"
                  placeholder="spring-boot-mastery"
                />
                <p className="mt-1 text-xs text-gray-600">
                  URL-friendly, lowercase, hyphens only
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                  placeholder="What is this series about?"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Cover Image URL (optional)
                </label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coverImage: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-3">
                <input
                  id="series-complete"
                  type="checkbox"
                  checked={form.isComplete}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isComplete: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="series-complete"
                  className="text-sm text-gray-300"
                >
                  Mark this series as complete
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="w-full rounded-lg bg-gray-800 px-5 py-2.5 text-sm text-white transition hover:bg-gray-700 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-gray-800 bg-gray-900"
            />
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[60vh] sm:py-16">
          <BookMarked size={52} className="mb-4 text-gray-700 sm:size-[56px]" />
          <p className="mb-2 text-xl text-gray-300 sm:text-2xl">
            No series yet
          </p>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
            Create a series to group related resources in order
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-6"
          >
            Create Series
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {series.map((s) => (
            <div
              key={s.id}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-700"
            >
              {s.coverImage && (
                <img
                  src={s.coverImage}
                  alt={s.title}
                  className="h-32 w-full object-cover sm:h-36"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}

              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-start gap-3">
                  <Link to={`/series/${s.slug}`} className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-semibold text-white transition hover:text-blue-400 sm:text-lg">
                      {s.title}
                    </h3>
                  </Link>

                  <button
                    onClick={() => deleteSeries(s.id)}
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {s.description && (
                  <p className="mb-3 break-words text-sm leading-relaxed text-gray-400 line-clamp-2">
                    {s.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                  <span>{s.totalParts ?? 0} parts</span>

                  {s.isComplete && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={12} />
                      Complete
                    </span>
                  )}

                  <span className="break-all font-mono text-gray-600 sm:ml-auto">
                    /{s.slug}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}