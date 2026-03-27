import { useEffect, useMemo, useState } from "react";
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
        return (
          title.includes(q) ||
          desc.includes(q) ||
          link.includes(q) ||
          tags.includes(q)
        );
      });
    }

    const getTime = (r) => {
      const t = r.savedAt || r.createdAt || r.updatedAt || null;
      const ms = t ? new Date(t).getTime() : NaN;
      return Number.isFinite(ms) ? ms : r.id ?? 0;
    };

    rows.sort((a, b) =>
      sort === "latest" ? getTime(b) - getTime(a) : getTime(a) - getTime(b)
    );

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
        <div className="fixed left-4 right-4 top-20 z-50 sm:left-auto sm:right-6">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-green-600/40 bg-gray-900 text-green-300"
                : "border-red-600/40 bg-gray-900 text-red-300"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Saved
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-400">
                Your bookmarked resources — quick access anytime.
              </p>
            </div>

            <button
              onClick={fetchSaved}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-300 transition hover:border-gray-700 hover:text-white sm:w-auto"
              title="Refresh"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Search + Sort */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, tags, url..."
                className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-3 text-gray-200 outline-none placeholder:text-gray-500 focus:border-gray-700"
              />
            </div>

            <div className="relative w-full sm:w-44 shrink-0">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-10 text-sm text-gray-200 outline-none transition hover:border-gray-700 focus:border-gray-700 focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
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

          {/* List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
              {filtered.map((resource) => {
                const resourceForCard = {
                  ...resource,
                  createdAt: resource.savedAt || resource.createdAt,
                };

                return (
                  <div key={resource.id} className="min-w-0">
                    <ResourceCard
                      resource={resourceForCard}
                      onUnsaved={(id) => {
                        setResources((prev) => prev.filter((r) => r.id !== id));
                        showToast("success", "Removed from saved ✅");
                      }}
                      footerRight={
                        <button
                          onClick={() => removeSaved(resource.id)}
                          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-200 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                        >
                          Remove
                        </button>
                      }
                    />
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-14 text-center text-gray-500 sm:py-16">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-800">
                    <Bookmark size={18} className="text-blue-400" />
                  </div>
                  <div className="text-sm sm:text-base">No saved resources yet</div>
                  <div className="mt-2 text-xs text-gray-600">
                    Save something from Explore and it’ll show here.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && meta.totalPages > 1 && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500">
                Page <span className="text-gray-300">{page + 1}</span> /{" "}
                <span className="text-gray-300">{meta.totalPages}</span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={meta.first || page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-gray-300 transition hover:border-gray-700 hover:text-white disabled:opacity-50 sm:flex-none"
                >
                  Prev
                </button>
                <button
                  disabled={meta.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-gray-300 transition hover:border-gray-700 hover:text-white disabled:opacity-50 sm:flex-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium text-white">
              <Tag size={16} className="text-blue-400" />
              Tags in Saved
            </h3>

            {allTags.length === 0 ? (
              <div className="text-sm text-gray-500">No tags yet</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => setQuery(tag.name)}
                    className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-300 transition hover:bg-blue-600 hover:text-white"
                  >
                    #{tag.name}
                    <span className="ml-1 text-gray-500">{tag.count}</span>
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