// src/pages/FeedPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import client from "../api/client";
import ResourceCard from "../components/ResourceCard";
import { CardErrorBoundary } from "../components/ErrorBoundary";
import WhoToFollow from "../components/WhoToFollow";
import { useAuth } from "../store/authStore";
import { Tag, Plus, X, Users, Flame, ArrowRight, Sparkles } from "lucide-react";
import { usePageTitle } from '../hooks/usePageTitle'

const TABS = [
  { key: "people", label: "People", icon: Users, desc: "From people you follow" },
  { key: "tags", label: "Tags", icon: Tag, desc: "From tags you follow" },
];

function PillTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border
        ${
          active
            ? "bg-blue-600/15 text-blue-300 border-blue-600/25"
            : "bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800 hover:border-gray-700"
        }`}
    >
      <Icon size={15} className={active ? "text-blue-300" : "text-gray-400"} />
      {label}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-800 rounded w-1/2" />
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 bg-gray-800 rounded-xl" />
        <div className="h-7 w-16 bg-gray-800 rounded-xl" />
        <div className="h-7 w-24 bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  usePageTitle('Feed')
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("people");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [followedTags, setFollowedTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const loadMoreRef = useRef(null);

  // ✅ Fetch followed tags ALWAYS (so sidebar always has data)
  useEffect(() => {
    if (user) fetchFollowedTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch feed on tab change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchFeed(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) fetchFeed(page);
      },
      { rootMargin: "250px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, loading, loadingMore, activeTab]);

  const fetchFeed = async (pageToLoad = page, reset = false) => {
    if (!hasMore && !reset) return;

    reset ? setLoading(true) : setLoadingMore(true);

    try {
      const url =
        activeTab === "tags"
          ? `/api/explore/tags?page=${pageToLoad}&size=10`
          : `/api/feed?page=${pageToLoad}&size=10`;

      const res = await client.get(url);
      const newItems = res.data.content || [];

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

  const fetchFollowedTags = async () => {
    setTagsLoading(true);
    try {
      const res = await client.get("/api/tags/following");
      setFollowedTags(res.data || []);
    } catch {
      setFollowedTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  const unfollowTag = async (tagName) => {
    try {
      await client.delete(`/api/tags/${tagName}/follow`);
      setFollowedTags((prev) => prev.filter((t) => t.name !== tagName));

      // If user is on tags feed, refresh list
      if (activeTab === "tags") {
        setPage(0);
        setHasMore(true);
        fetchFeed(0, true);
      }
    } catch {}
  };

  const tabMeta = useMemo(() => TABS.find((t) => t.key === activeTab), [activeTab]);

  const EmptyState = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
      {activeTab === "people" ? (
        <>
          <Users size={34} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-semibold">Your people feed is empty</p>
          <p className="text-gray-500 text-sm mt-1">
            Follow people to see their resources here.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              <Sparkles size={16} className="text-gray-400" />
              Explore
            </Link>
          </div>
        </>
      ) : (
        <>
          <Tag size={34} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-semibold">No tag feed yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Follow tags from Explore to see matching resources here.
          </p>
          <div className="mt-5">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-blue-600/20 bg-blue-600/10 text-blue-300 hover:bg-blue-600/15 transition"
            >
              <Plus size={16} />
              Follow tags on Explore
              <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="flex gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-white text-xl font-semibold">Your Feed</h1>
                <p className="text-gray-500 text-sm mt-1">{tabMeta?.desc}</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                {TABS.map((t) => (
                  <PillTab
                    key={t.key}
                    active={activeTab === t.key}
                    icon={t.icon}
                    label={t.label}
                    onClick={() => {
                      setActiveTab(t.key);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>
            </div>


          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {resources.map((r) => (
                <CardErrorBoundary key={r.id}>
                  <ResourceCard resource={r} />
                </CardErrorBoundary>
              ))}

              {loadingMore && (
                <div className="text-center text-gray-500 py-6 text-sm">Loading more…</div>
              )}

              {!hasMore && resources.length > 0 && (
                <div className="text-center text-gray-600 py-6 text-sm">
                  You’ve reached the end ✨
                </div>
              )}

              <div ref={loadMoreRef} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <WhoToFollow />

            {/* Tags You Follow */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                <Tag size={14} className="text-blue-400" /> Tags You Follow
              </h3>

              {tagsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-7 w-20 bg-gray-800 rounded-full animate-pulse" />
                  ))}
                </div>
              ) : followedTags.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No tags followed yet.{" "}
                  <Link to="/explore" className="text-blue-400 hover:text-blue-300">
                    Follow from Explore
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {followedTags.map((tag) => (
                    <span
                      key={tag.name}
                      className="px-2.5 py-1.5 bg-blue-600/10 text-blue-300 text-xs rounded-xl border border-blue-600/20"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to="/explore"
                className="mt-3 inline-flex items-center gap-1 text-gray-500 hover:text-blue-400 text-xs transition"
              >
                <Plus size={12} /> Follow more tags
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}