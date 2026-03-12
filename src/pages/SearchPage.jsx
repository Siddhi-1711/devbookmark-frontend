// src/pages/SearchPage.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import { Heart, Bookmark, Search, X } from "lucide-react";
import { usePageTitle } from '../hooks/usePageTitle'

const TYPES = ["ALL", "ARTICLE", "VIDEO", "REPO", "DOC", "WRITTEN_POST"];
const SORTS = ["latest", "oldest", "popular"];

export default function SearchPage() {
  usePageTitle('Search')
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

  // suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2) fetchSuggestions();
      else setSuggestions({ titles: [], tags: [] });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // auto-search when type/sort changes (only if user has something to search)
  useEffect(() => {
    if (q || author || type !== "ALL") search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sort]);

  const fetchSuggestions = async () => {
    try {
      const res = await client.get(`/api/search/suggestions?q=${encodeURIComponent(q.trim())}`);
      setSuggestions(res.data || { titles: [], tags: [] });
    } catch (err) {
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
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold">Search</h1>
          {anyFilter && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Clear all
            </button>
          )}
        </div>

        <form onSubmit={search} className="mb-6">
          <div className="relative mb-3">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources, articles, links..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:border-blue-500 transition text-lg"
              autoFocus
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setSuggestions({ titles: [], tags: [] });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                aria-label="Clear query"
              >
                <X size={18} />
              </button>
            )}

            {(suggestions.titles.length > 0 || suggestions.tags.length > 0) && (
              <div className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl mt-1 z-10 overflow-hidden">
                {suggestions.titles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setQ(title);
                      setSuggestions({ titles: [], tags: [] });
                      // search with the selected title
                      setTimeout(() => search(), 0);
                    }}
                    className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-gray-800 text-sm"
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
                    className="w-full text-left px-4 py-2.5 text-blue-400 hover:bg-gray-800 text-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs transition ${
                  type === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {t === "ALL"
                  ? "All Types"
                  : t === "WRITTEN_POST"
                  ? "Article"
                  : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${
                  sort === s
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}

            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Filter by author..."
              className="ml-auto bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-48"
            />

            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              Search
            </button>
          </div>
        </form>

        {total > 0 && (
          <p className="text-gray-500 text-sm mb-4">{total} results found</p>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => (
              <SearchResultCard key={r.id} resource={r} />
            ))}

            {results.length === 0 && q && !loading && (
              <div className="text-center text-gray-500 py-16">No results for "{q}"</div>
            )}
            {!q && results.length === 0 && (
              <div className="text-center text-gray-500 py-16">
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
    } catch (err) {}
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
    } catch (err) {}
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-center gap-2 mb-2">
        <Link to={`/users/${resource.ownerId}`} className="text-gray-400 text-sm hover:text-white transition">
          {resource.ownerName}
        </Link>
        <span className="text-gray-600 text-xs">•</span>
        <span className="text-gray-600 text-xs">{new Date(resource.createdAt).toLocaleDateString()}</span>
        <span className="ml-auto text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
          {resource.type === "WRITTEN_POST" ? "Article" : resource.type}
        </span>
      </div>

      <Link to={`/resources/${resource.id}`}>
        <h3 className="text-white font-semibold text-lg mb-1 hover:text-blue-400 transition">
          {resource.title}
        </h3>
      </Link>

      {resource.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
      )}

      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-800 text-blue-400 text-xs rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 transition ${liked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
        </button>

        <button
          onClick={toggleSave}
          className={`flex items-center gap-1 transition ${saved ? "text-blue-400" : "text-gray-500 hover:text-blue-400"}`}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} /> {saveCount}
        </button>

        {resource.link && (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-blue-400 hover:text-blue-300 text-xs"
          >
            Visit
          </a>
        )}
      </div>
    </div>
  );
}