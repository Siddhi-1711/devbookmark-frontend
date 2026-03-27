import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import { Heart, Bookmark, Search, X, Filter } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";

const TYPES = ["ALL", "ARTICLE", "VIDEO", "REPO", "DOC", "WRITTEN_POST"];
const SORTS = ["latest", "oldest", "popular"];

const getTypeLabel = (t) => {
  if (t === "ALL") return "All Types";
  if (t === "WRITTEN_POST") return "Article";
  return t.charAt(0) + t.slice(1).toLowerCase();
};

export default function SearchPage() {
  usePageTitle("Search");
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState({ titles: [], tags: [] });

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2) fetchSuggestions();
      else setSuggestions({ titles: [], tags: [] });
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (q || author || type !== "ALL") search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sort]);

  const fetchSuggestions = async () => {
    try {
      const res = await client.get(
        `/api/search/suggestions?q=${encodeURIComponent(q.trim())}`
      );
      setSuggestions(res.data || { titles: [], tags: [] });
    } catch {
      setSuggestions({ titles: [], tags: [] });
    }
  };

  const buildAndSetUrlParams = (next = {}) => {
    const params = {
      q,
      type,
      sort,
      author,
      ...next,
    };

    const sp = {};
    if (params.q) sp.q = params.q;
    if (params.type && params.type !== "ALL") sp.type = params.type;
    if (params.sort && params.sort !== "latest") sp.sort = params.sort;
    if (params.author) sp.author = params.author;

    setSearchParams(sp, { replace: true });
    return params;
  };

  const search = async (e) => {
    if (e) e.preventDefault();

    const paramsState = buildAndSetUrlParams();

    setLoading(true);
    setSuggestions({ titles: [], tags: [] });

    try {
      const params = new URLSearchParams();
      if (paramsState.q) params.set("q", paramsState.q);
      if (paramsState.type !== "ALL") params.set("type", paramsState.type);
      if (paramsState.sort) params.set("sort", paramsState.sort);
      if (paramsState.author) params.set("author", paramsState.author);
      params.set("size", "20");

      const res = await client.get(`/api/search/resources?${params}`);
      setResults(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQ("");
    setType("ALL");
    setSort("latest");
    setAuthor("");
    setResults([]);
    setTotal(0);
    setSuggestions({ titles: [], tags: [] });
    setSearchParams({}, { replace: true });
  };

  const anyFilter = q || author || type !== "ALL" || sort !== "latest";

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-5">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Search</h1>
            <p className="mt-1 text-sm text-gray-500">
              Find resources by title, tags, author, and type.
            </p>
          </div>

          {anyFilter && (
            <button
              onClick={clearAll}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-400 transition hover:border-gray-700 hover:text-white sm:w-auto"
            >
              Clear all
            </button>
          )}
        </div>

        <form
          onSubmit={search}
          className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5"
        >
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources, articles, links..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-12 pr-12 text-base text-white transition placeholder:text-gray-500 focus:border-blue-500 focus:outline-none sm:text-lg"
              autoFocus
            />

            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setSuggestions({ titles: [], tags: [] });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                aria-label="Clear query"
              >
                <X size={18} />
              </button>
            )}

            {(suggestions.titles.length > 0 || suggestions.tags.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
                {suggestions.titles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setQ(title);
                      setSuggestions({ titles: [], tags: [] });
                      setTimeout(() => search(), 0);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800"
                  >
                    {title}
                  </button>
                ))}

                {suggestions.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQ(tag);
                      setSuggestions({ titles: [], tags: [] });
                      setTimeout(() => search(), 0);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-blue-400 hover:bg-gray-800"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Type
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {getTypeLabel(t)}
                    </option>
                  ))}
                </select>

                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                <Filter size={13} />
                Sort
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>

                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Filter by author..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Search
            </button>
          </div>
        </form>

        {total > 0 && (
          <p className="mb-4 text-sm text-gray-500">{total} results found</p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5"
              >
                <div className="mb-3 h-4 w-3/4 rounded bg-gray-800" />
                <div className="h-3 w-1/2 rounded bg-gray-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => (
              <SearchResultCard key={r.id} resource={r} />
            ))}

            {results.length === 0 && q && !loading && (
              <div className="py-16 text-center text-gray-500">
                No results for "{q}"
              </div>
            )}

            {!q && results.length === 0 && (
              <div className="py-16 text-center text-gray-500">
                Start typing to search resources
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ resource }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(!!resource.likedByMe);
  const [saved, setSaved] = useState(!!resource.savedByMe);
  const [likeCount, setLikeCount] = useState(resource.likeCount ?? 0);
  const [saveCount, setSaveCount] = useState(resource.saveCount ?? 0);

  const toggleLike = async () => {
    if (!user) return;
    try {
      if (liked) {
        await client.delete(`/api/resources/${resource.id}/like`);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await client.post(`/api/resources/${resource.id}/like`);
        setLikeCount((c) => c + 1);
      }
      setLiked((v) => !v);
    } catch {}
  };

  const toggleSave = async () => {
    if (!user) return;
    try {
      if (saved) {
        await client.delete(`/api/resources/${resource.id}/save`);
        setSaveCount((c) => Math.max(0, c - 1));
      } else {
        await client.post(`/api/resources/${resource.id}/save`);
        setSaveCount((c) => c + 1);
      }
      setSaved((v) => !v);
    } catch {}
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700 sm:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to={`/users/${resource.ownerId}`}
              className="truncate text-gray-400 transition hover:text-white"
            >
              {resource.ownerName}
            </Link>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-600">
              {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <span className="w-fit rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
          {resource.type === "WRITTEN_POST" ? "Article" : resource.type}
        </span>
      </div>

      <Link to={`/resources/${resource.id}`}>
        <h3 className="mb-1 break-words text-lg font-semibold text-white transition hover:text-blue-400">
          {resource.title}
        </h3>
      </Link>

      {resource.description && (
        <p className="mb-3 line-clamp-2 break-words text-sm text-gray-400">
          {resource.description}
        </p>
      )}

      {resource.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-800 px-2 py-0.5 text-xs text-blue-400 break-all"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 transition ${
            liked ? "text-red-400" : "text-gray-500 hover:text-red-400"
          }`}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
        </button>

        <button
          onClick={toggleSave}
          className={`flex items-center gap-1 transition ${
            saved ? "text-blue-400" : "text-gray-500 hover:text-blue-400"
          }`}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} /> {saveCount}
        </button>

        {resource.link && (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 sm:ml-auto"
          >
            Visit
          </a>
        )}
      </div>
    </div>
  );
}