// src/pages/ExplorePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import client from "../api/client";
import ResourceCard from "../components/ResourceCard";
import WhoToFollow from "../components/WhoToFollow";
import { useAuth } from "../store/authStore";
import { Tag, Plus, Check, X, Flame, Star, Clock3, ArrowRight } from "lucide-react";

const TABS = [
  { key: "latest", label: "Latest", icon: Clock3 },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "popular", label: "Popular", icon: Star },
];

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-gray-800" />
        <div className="flex-1">
          <div className="h-3 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/5" />
        </div>
      </div>
      <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-800 rounded w-1/2 mb-6" />
      <div className="flex gap-2">
        <div className="h-7 bg-gray-800 rounded w-16" />
        <div className="h-7 bg-gray-800 rounded w-20" />
        <div className="h-7 bg-gray-800 rounded w-14" />
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
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border
        ${
          active
            ? "bg-blue-600/15 text-blue-300 border-blue-600/25"
            : "bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800 hover:border-gray-700"
        }`}
    >
      <Icon size={15} className={active ? "text-blue-300" : "text-gray-400"} />
      {children}
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

  // ─── Picker mode (add resources to collection) ───────────────────────────
  const pickFor = searchParams.get('pickFor')       // collection id
  const pickName = searchParams.get('pickName')     // collection name
  const isPickMode = !!pickFor
  const [selected, setSelected] = useState(new Set())
  const [adding, setAdding] = useState(false)
  const [addedIds, setAddedIds] = useState(new Set())

  const loadMoreRef = useRef(null);

  const newCollectionId = searchParams.get("newCollection");

  // Keep URL params clean but preserve newCollection param
  const updateParams = (tagNameOrNull) => {
    const next = {};
    if (tagNameOrNull) next.tag = tagNameOrNull;
    if (newCollectionId) next.newCollection = newCollectionId;
    if (pickFor) next.pickFor = pickFor;
    if (pickName) next.pickName = pickName;
    setSearchParams(next);
  }

  // URL -> state
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl && tagFromUrl !== selectedTag) setSelectedTag(tagFromUrl);
    if (!tagFromUrl && selectedTag !== null) setSelectedTag(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // state -> URL
  useEffect(() => {
    updateParams(selectedTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  // fetch resources + tags
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchResources(0, true);
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTag]);

  // infinite scroll
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

  // followed tags
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
        // NOTE: trending under tag currently behaves like latest (your logic). Keep stable.
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
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirmAdd = async () => {
    if (selected.size === 0 || !pickFor) return
    setAdding(true)
    const ids = [...selected]
    const results = await Promise.allSettled(
      ids.map(id => client.post(`/api/collections/${pickFor}/resources/${id}`))
    )
    const succeeded = new Set(ids.filter((_, i) => results[i].status === 'fulfilled'))
    setAddedIds(prev => new Set([...prev, ...succeeded]))
    setSelected(new Set())
    setAdding(false)
  }

  const clearTag = () => {
    setSelectedTag(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="flex gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header / Controls */}
          <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">


              {/* Tabs as segmented pills */}
              <div className="flex items-center gap-2">
                {TABS.map((tab) => (
                  <PillButton
                    key={tab.key}
                    active={activeTab === tab.key}
                    icon={tab.icon}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedTag(null); // your behavior
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {tab.label}
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Picker mode banner */}
            {isPickMode && (
              <div className="mt-4 px-4 py-3 bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-blue-200 text-sm font-medium">
                    Adding to: <span className="text-white">{decodeURIComponent(pickName || '')}</span>
                  </p>
                  <p className="text-blue-300/70 text-xs mt-0.5">Click resources to select them</p>
                </div>
                <button
                  onClick={() => navigate(`/collections`)}
                  className="shrink-0 text-blue-300 hover:text-white text-xs underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Success banner */}
            {newCollectionId && (
              <div className="mt-5 px-4 py-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-blue-200 text-sm flex items-center justify-between gap-4">
                <span className="min-w-0">
                  🎉 Collection created! Use <strong>Save to Collection</strong> on any resource.
                </span>
                <Link
                  to="/collections"
                  className="shrink-0 text-blue-300 hover:text-white text-xs underline"
                >
                  View Collections
                </Link>
              </div>
            )}

            {/* Active filter row */}
            {(selectedTag || activeTab !== "latest") && (
              <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-gray-500">Showing</span>
                  <span className="px-2 py-0.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300">
                    {activeTabMeta.label}
                  </span>
                  {selectedTag && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="px-2 py-0.5 bg-blue-600/15 text-blue-300 rounded-lg border border-blue-600/20">
                        #{selectedTag}
                      </span>
                    </>
                  )}
                </div>

                {selectedTag && (
                  <button
                    type="button"
                    onClick={clearTag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white transition"
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
                <div className="text-center text-gray-500 py-6 text-sm">
                  Loading more…
                </div>
              )}

              <div ref={loadMoreRef} />

              {!loadingMore && resources.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-white font-semibold">No resources found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Try switching the tab or clearing the tag filter.
                  </p>
                  {selectedTag && (
                    <button
                      type="button"
                      onClick={clearTag}
                      className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white transition"
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
               <div className="w-80 shrink-0 hidden lg:block">
                 <div className="sticky top-20 space-y-5">
                   {/* Tags */}
                   <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                     <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                       <Tag size={15} className="text-blue-400" />
                       Trending Tags
                     </h3>

                     {/* Content */}
                     <div>
                       {/* Scrollable tag area - compact capsule layout */}
                       <div className="max-h-40 overflow-y-auto pr-2" style={{
                         scrollbarWidth: 'thin',
                         scrollbarColor: '#4b5563 transparent'
                       }}>
                         <div className="flex flex-wrap gap-2">
                           {tags.map(tag => {
                             const isActive = selectedTag === tag.name;
                             const isFollowed = user && followedTags.has(tag.name);
                             return (
                               <div
                                 key={tag.name}
                                 className="group/tag relative cursor-pointer transition duration-200"
                                 onClick={() => {
                                   setSelectedTag(isActive ? null : tag.name);
                                   window.scrollTo({ top: 0, behavior: 'smooth' });
                                 }}
                               >
                                 <div className={`
                                   inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition duration-200 relative overflow-hidden text-xs font-medium whitespace-nowrap
                                   ${isActive
                                     ? 'bg-blue-600/25 border-blue-500/50 text-blue-200 shadow-lg shadow-blue-500/10'
                                     : 'bg-gray-700/40 border-gray-700/50 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600/50 hover:text-white'
                                   }
                                 `}>
                                   {/* Hover accent line */}
                                   <div className={`absolute inset-x-0 top-0 h-px transition duration-200 ${isActive ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50' : 'bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-0 group-hover/tag:opacity-30'}`} />

                                   {/* Tag content */}
                                   <span className="text-gray-400 font-semibold">#</span>
                                   <span className="font-medium">{tag.name}</span>


                                   {/* Follow button */}
                                   {user && (
                                     <button
                                       onClick={e => toggleTagFollow(tag.name, e)}
                                       title={isFollowed ? 'Unfollow' : 'Follow'}
                                       className={`
                                         p-0.5 rounded-md transition duration-200 flex items-center justify-center ml-0.5
                                         ${isFollowed
                                           ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40'
                                           : 'bg-transparent text-gray-600 opacity-0 group-hover/tag:opacity-100 hover:text-blue-400 hover:bg-blue-600/20'
                                         }
                                       `}>
                                       {isFollowed ? <Check size={12} /> : <Plus size={12} />}
                                     </button>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>

                       {/* View tag feed link */}
                       {user && followedTags.size > 0 && (
                         <Link
                           to="/feed"
                           className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-4 transition">

                           View tag feed
                           →
                         </Link>
                       )}

                       {/* Helper text */}
                       <p className="text-xs text-gray-600 mt-3.5 text-center font-medium">Click to filter · + to follow</p>
                     </div>
                   </div>

                   <WhoToFollow />
                 </div>
               </div>
             </div>
      {/* Picker sticky footer */}
      {isPickMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              {selected.size > 0
                ? <span className="text-white font-medium">{selected.size} resource{selected.size > 1 ? 's' : ''} selected</span>
                : <span>No resources selected</span>
              }
              {addedIds.size > 0 && (
                <span className="ml-3 text-green-400 text-xs">✓ {addedIds.size} added</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {addedIds.size > 0 && (
                <button
                 onClick={() => navigate(`/collections/${pickFor}`, { replace: true })}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition"
                >
                  View Collection
                </button>
              )}
              <button
                onClick={confirmAdd}
                disabled={selected.size === 0 || adding}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition font-medium"
              >
                {adding ? 'Adding...' : `Add ${selected.size > 0 ? selected.size : ''} to Collection`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}