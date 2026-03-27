// src/pages/ExplorePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import client from "../api/client";
import ResourceCard from "../components/ResourceCard";
import WhoToFollow from "../components/WhoToFollow";
import { useAuth } from "../store/authStore";
import {
  Tag,
  Plus,
  Check,
  X,
  Flame,
  Star,
  Clock3,
} from "lucide-react";

const TABS = [
  { key: "latest", label: "Latest", icon: Clock3 },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "popular", label: "Popular", icon: Star },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5 animate-pulse">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gray-800" />
        <div className="flex-1">
          <div className="mb-2 h-3 w-1/3 rounded bg-gray-800" />
          <div className="h-3 w-1/5 rounded bg-gray-800" />
        </div>
      </div>
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-800" />
      <div className="mb-6 h-3 w-1/2 rounded bg-gray-800" />
      <div className="flex flex-wrap gap-2">
        <div className="h-7 w-16 rounded bg-gray-800" />
        <div className="h-7 w-20 rounded bg-gray-800" />
        <div className="h-7 w-14 rounded bg-gray-800" />
      </div>
    </div>
  );
}

function PillButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition sm:px-3.5
        ${
          active
            ? "border-blue-600/25 bg-blue-600/15 text-blue-300"
            : "border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:bg-gray-800"
        }`}
    >
      <Icon size={15} className={active ? "text-blue-300" : "text-gray-400"} />
      <span>{children}</span>
    </button>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedTag, setSelectedTag] = useState(null);

  const [resources, setResources] = useState([]);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeTab, setActiveTab] = useState("latest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [followedTags, setFollowedTags] = useState(new Set());

  // picker mode
  const pickFor = searchParams.get("pickFor");
  const pickName = searchParams.get("pickName");
  const isPickMode = !!pickFor;
  const [selected, setSelected] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const loadMoreRef = useRef(null);

  const newCollectionId = searchParams.get("newCollection");

  const updateParams = (tagNameOrNull) => {
    const next = {};
    if (tagNameOrNull) next.tag = tagNameOrNull;
    if (newCollectionId) next.newCollection = newCollectionId;
    if (pickFor) next.pickFor = pickFor;
    if (pickName) next.pickName = pickName;
    setSearchParams(next);
  };

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl && tagFromUrl !== selectedTag) setSelectedTag(tagFromUrl);
    if (!tagFromUrl && selectedTag !== null) setSelectedTag(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    updateParams(selectedTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchResources(0, true);
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTag]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          fetchResources(page);
        }
      },
      { rootMargin: "700px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, loading, loadingMore, activeTab, selectedTag]);

  useEffect(() => {
    if (user) fetchFollowedTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFollowedTags = async () => {
    try {
      const res = await client.get("/api/tags/following");
      setFollowedTags(new Set(res.data.map((t) => t.name)));
    } catch {}
  };

  const toggleTagFollow = async (tagName, e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (followedTags.has(tagName)) {
        await client.delete(`/api/tags/${tagName}/follow`);
        setFollowedTags((prev) => {
          const n = new Set(prev);
          n.delete(tagName);
          return n;
        });
      } else {
        await client.post(`/api/tags/${tagName}/follow`);
        setFollowedTags((prev) => new Set([...prev, tagName]));
      }
    } catch {}
  };

  const fetchTags = async () => {
    try {
      const res = await client.get("/api/tags/trending?limit=15");
      setTags(res.data);
    } catch {}
  };

  const fetchResources = async (pageToLoad = page, reset = false) => {
    if (!hasMore && !reset) return;

    reset ? setLoading(true) : setLoadingMore(true);

    try {
      let url;

      if (selectedTag) {
        url = `/api/search/resources?tags=${selectedTag}&page=${pageToLoad}&sort=${
          activeTab === "popular" ? "popular" : "latest"
        }`;
      } else {
        url = `/api/explore/${activeTab}?page=${pageToLoad}`;
      }

      const res = await client.get(url);
      const newItems = res.data.content || res.data;

      setResources((prev) => (reset ? newItems : [...prev, ...newItems]));
      setHasMore(res.data.last !== undefined ? !res.data.last : newItems.length > 0);
      setPage(pageToLoad + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const activeTabMeta = useMemo(
    () => TABS.find((t) => t.key === activeTab) || TABS[0],
    [activeTab]
  );

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmAdd = async () => {
    if (selected.size === 0 || !pickFor) return;

    setAdding(true);
    const ids = [...selected];

    const results = await Promise.allSettled(
      ids.map((id) => client.post(`/api/collections/${pickFor}/resources/${id}`))
    );

    const succeeded = new Set(
      ids.filter((_, i) => results[i].status === "fulfilled")
    );

    setAddedIds((prev) => new Set([...prev, ...succeeded]));
    setSelected(new Set());
    setAdding(false);
  };

  const clearTag = () => {
    setSelectedTag(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bottomSpacingClass = isPickMode ? "pb-28 sm:pb-24" : "";

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className={`flex flex-col gap-6 lg:flex-row lg:gap-8 ${bottomSpacingClass}`}>
        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header / Controls */}
          <div className="mb-5 sm:mb-6">
            <div className="flex flex-col gap-3">
              {/* Tabs */}
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-2 px-1">
                  {TABS.map((tab) => (
                    <PillButton
                      key={tab.key}
                      active={activeTab === tab.key}
                      icon={tab.icon}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSelectedTag(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {tab.label}
                    </PillButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Picker mode banner */}
            {isPickMode && (
              <div className="mt-4 rounded-2xl border border-blue-500/25 bg-blue-600/10 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-200 break-words">
                      Adding to:{" "}
                      <span className="text-white">
                        {decodeURIComponent(pickName || "")}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-blue-300/70">
                      Click resources to select them
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/collections`)}
                    className="w-full shrink-0 rounded-xl border border-blue-400/20 px-3 py-2 text-sm text-blue-300 transition hover:text-white sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Success banner */}
            {newCollectionId && (
              <div className="mt-4 rounded-2xl border border-blue-600/20 bg-blue-600/10 px-4 py-3 text-sm text-blue-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 break-words">
                    🎉 Collection created! Use <strong>Save to Collection</strong> on any
                    resource.
                  </span>

                  <Link
                    to="/collections"
                    className="w-full shrink-0 rounded-xl border border-blue-400/20 px-3 py-2 text-center text-sm text-blue-300 transition hover:text-white sm:w-auto"
                  >
                    View Collections
                  </Link>
                </div>
              </div>
            )}

            {/* Active filter row */}
            {(selectedTag || activeTab !== "latest") && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span className="text-gray-500">Showing</span>

                  <span className="rounded-lg border border-gray-800 bg-gray-900 px-2 py-0.5 text-gray-300">
                    {activeTabMeta.label}
                  </span>

                  {selectedTag && (
                    <>
                      <span className="hidden text-gray-600 sm:inline">•</span>
                      <span className="rounded-lg border border-blue-600/20 bg-blue-600/15 px-2 py-0.5 text-blue-300 break-all">
                        #{selectedTag}
                      </span>
                    </>
                  )}
                </div>

                {selectedTag && (
                  <button
                    type="button"
                    onClick={clearTag}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-300 transition hover:bg-gray-800 hover:text-white sm:w-auto"
                  >
                    <X size={14} className="text-gray-400" />
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  selectable={isPickMode}
                  selected={isPickMode && selected.has(r.id)}
                  onSelect={isPickMode ? toggleSelect : undefined}
                />
              ))}

              {loadingMore && (
                <div className="py-6 text-center text-sm text-gray-500">
                  Loading more…
                </div>
              )}

              <div ref={loadMoreRef} />

              {!loadingMore && resources.length === 0 && (
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center sm:p-10">
                  <p className="font-semibold text-white">No resources found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try switching the tab or clearing the tag filter.
                  </p>

                  {selectedTag && (
                    <button
                      type="button"
                      onClick={clearTag}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
                    >
                      <X size={16} className="text-gray-400" />
                      Clear tag filter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-20 space-y-5">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Tag size={15} className="text-blue-400" />
                Trending Tags
              </h3>

              <div>
                <div
                  className="max-h-40 overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4b5563 transparent",
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isActive = selectedTag === tag.name;
                      const isFollowed = user && followedTags.has(tag.name);

                      return (
                        <div
                          key={tag.name}
                          className="group/tag relative cursor-pointer transition duration-200"
                          onClick={() => {
                            setSelectedTag(isActive ? null : tag.name);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <div
                            className={`
                              relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition duration-200
                              ${
                                isActive
                                  ? "border-blue-500/50 bg-blue-600/25 text-blue-200 shadow-lg shadow-blue-500/10"
                                  : "border-gray-700/50 bg-gray-700/40 text-gray-300 hover:border-gray-600/50 hover:bg-gray-700/60 hover:text-white"
                              }
                            `}
                          >
                            <div
                              className={`absolute inset-x-0 top-0 h-px transition duration-200 ${
                                isActive
                                  ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"
                                  : "bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-0 group-hover/tag:opacity-30"
                              }`}
                            />

                            <span className="font-semibold text-gray-400">#</span>
                            <span className="font-medium">{tag.name}</span>

                            {user && (
                              <button
                                onClick={(e) => toggleTagFollow(tag.name, e)}
                                title={isFollowed ? "Unfollow" : "Follow"}
                                className={`
                                  ml-0.5 flex items-center justify-center rounded-md p-0.5 transition duration-200
                                  ${
                                    isFollowed
                                      ? "bg-blue-600/30 text-blue-300 hover:bg-blue-600/40"
                                      : "bg-transparent text-gray-600 opacity-0 hover:bg-blue-600/20 hover:text-blue-400 group-hover/tag:opacity-100"
                                  }
                                `}
                              >
                                {isFollowed ? <Check size={12} /> : <Plus size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {user && followedTags.size > 0 && (
                  <Link
                    to="/feed"
                    className="mt-4 block text-center text-xs text-blue-400 transition hover:text-blue-300"
                  >
                    View tag feed →
                  </Link>
                )}

                <p className="mt-3.5 text-center text-xs font-medium text-gray-600">
                  Click to filter · + to follow
                </p>
              </div>
            </div>

            <WhoToFollow />
          </div>
        </div>
      </div>

      {/* Picker sticky footer */}
      {isPickMode && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-800 bg-gray-950/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm text-gray-400">
                {selected.size > 0 ? (
                  <span className="font-medium text-white">
                    {selected.size} resource{selected.size > 1 ? "s" : ""} selected
                  </span>
                ) : (
                  <span>No resources selected</span>
                )}

                {addedIds.size > 0 && (
                  <span className="mt-1 block text-xs text-green-400 sm:ml-3 sm:mt-0 sm:inline">
                    ✓ {addedIds.size} added
                  </span>
                )}
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                {addedIds.size > 0 && (
                  <button
                    onClick={() => navigate(`/collections/${pickFor}`, { replace: true })}
                    className="w-full rounded-xl bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700 sm:w-auto"
                  >
                    View Collection
                  </button>
                )}

                <button
                  onClick={confirmAdd}
                  disabled={selected.size === 0 || adding}
                  className="w-full rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  {adding
                    ? "Adding..."
                    : `Add ${selected.size > 0 ? selected.size : ""} to Collection`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}