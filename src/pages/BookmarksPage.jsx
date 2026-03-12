import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import client from "../api/client";
import { Bookmark, Tag, Search, RefreshCw, Filter } from "lucide-react";
import { useAuth } from "../store/authStore";
import ResourceCard from "../components/ResourceCard";
import AppLayout from "../layout/AppLayout";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest"); // latest | oldest
  const [page, setPage] = useState(0);
  const size = 8;

  const [meta, setMeta] = useState({
    first: true,
    last: true,
    totalPages: 1,
    totalElements: 0,
  });

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/resources/my-saved", {
        params: { page, size },
      });

      const content = res.data?.content ?? res.data ?? [];
      setResources(content);

      setMeta({
        first: !!res.data?.first,
        last: !!res.data?.last,
        totalPages: res.data?.totalPages ?? 1,
        totalElements: res.data?.totalElements ?? content.length,
      });
    } catch (err) {
      console.error(err);
      setResources([]);
      setMeta({ first: true, last: true, totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };
const showToast = (type, message) => {
  setToast({ type, message });
  setTimeout(() => setToast(null), 2500);
};
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = [...resources];

    if (q) {
      rows = rows.filter((r) => {
        const title = (r.title || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        const link = (r.link || r.url || "").toLowerCase();
        const tags = (r.tags || []).join(" ").toLowerCase();
        return title.includes(q) || desc.includes(q) || link.includes(q) || tags.includes(q);
      });
    }

    const getTime = (r) => {
      // ✅ For Saved page, primary sorting should be when YOU saved it
      const t = r.savedAt || r.createdAt || r.updatedAt || null;
      const ms = t ? new Date(t).getTime() : NaN;
      return Number.isFinite(ms) ? ms : (r.id ?? 0);
    };

    rows.sort((a, b) => (sort === "latest" ? getTime(b) - getTime(a) : getTime(a) - getTime(b)));
    return rows;
  }, [resources, query, sort]);

  const allTags = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      (r.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [filtered]);

const removeSaved = async (id) => {
  if (!user) return;
  try {
    await client.delete(`/api/resources/${id}/save`);
    setResources((prev) => prev.filter((r) => r.id !== id));
    showToast("success", "Removed from saved ✅");
  } catch (err) {
    console.error(err);
    showToast("error", "Could not remove. Try again.");
  }
};

return (
  <AppLayout maxWidth="max-w-6xl">
{toast && (
  <div className="fixed top-20 right-6 z-50">
    <div
      className={`px-4 py-3 rounded-xl border shadow-lg text-sm ${
        toast.type === "success"
          ? "bg-gray-900 border-green-600/40 text-green-300"
          : "bg-gray-900 border-red-600/40 text-red-300"
      }`}
    >
      {toast.message}
    </div>
  </div>
)}

        <div className="flex gap-8">
          {/* Main */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-white text-2xl font-semibold">Saved</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Your bookmarked resources — quick access anytime.
                </p>
              </div>

              <button
                onClick={fetchSaved}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition"
                title="Refresh"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, tags, url..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 placeholder:text-gray-500 outline-none focus:border-gray-700"
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"
                />

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="
                    w-full sm:w-44
                    appearance-none
                    pl-9 pr-10 py-2.5
                    rounded-lg
                    bg-gray-900
                    border border-gray-800
                    text-gray-200 text-sm
                    outline-none
                    hover:border-gray-700
                    focus:border-gray-700
                    focus:ring-2 focus:ring-blue-600/20
                    transition
                  "
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>

                {/* custom dropdown arrow */}
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
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

            {/* List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((resource) => {
                  const resourceForCard = {
                    ...resource,
                    // ✅ show saved date in UI on Saved page
                    createdAt: resource.savedAt || resource.createdAt,
                  };

                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resourceForCard}
                      onUnsaved={(id) => {
                        setResources((prev) => prev.filter((r) => r.id !== id));
                        showToast("success", "Removed from saved ✅");
                      }}
                      footerRight={
                        <button
                          onClick={() => removeSaved(resource.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-red-600 hover:border-red-500 hover:text-white transition text-xs"
                        >
                          Remove
                        </button>
                      }
                    />
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center text-gray-500 py-16 bg-gray-900 border border-gray-800 rounded-xl">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 grid place-items-center mb-3">
                      <Bookmark size={18} className="text-blue-400" />
                    </div>
                    No saved resources yet
                    <div className="text-xs text-gray-600 mt-2">
                      Save something from Explore and it’ll show here.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500">
                  Page <span className="text-gray-300">{page + 1}</span> /{" "}
                  <span className="text-gray-300">{meta.totalPages}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={meta.first || page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-50 transition"
                  >
                    Prev
                  </button>
                  <button
                    disabled={meta.last}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sticky top-20">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Tag size={16} className="text-blue-400" />
                Tags in Saved
              </h3>

              {allTags.length === 0 ? (
                <div className="text-gray-500 text-sm">No tags yet</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setQuery(tag.name)}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md hover:bg-blue-600 hover:text-white transition"
                    >
                      #{tag.name}
                      <span className="text-gray-500 ml-1">{tag.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
  </AppLayout>
);
}

