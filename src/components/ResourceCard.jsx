import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import {
  Bookmark,
  Heart,
  ExternalLink,
  Clock,
  Eye,
  Repeat2,
  CheckCircle2,
} from "lucide-react";

const TYPE_COLORS = {
  ARTICLE: "bg-blue-600/15 text-blue-400 border-blue-500/25",
  VIDEO: "bg-red-600/15 text-red-400 border-red-500/25",
  REPO: "bg-gray-600/25 text-gray-300 border-gray-500/25",
  DOC: "bg-yellow-600/15 text-yellow-400 border-yellow-500/25",
  WRITTEN_POST: "bg-green-600/15 text-green-400 border-green-500/25",
};

const TYPE_LABELS = {
  ARTICLE: "Article",
  VIDEO: "Video",
  REPO: "Repo",
  DOC: "Doc",
  WRITTEN_POST: "Post",
};

export default function ResourceCard({
  resource,
  footerRight,
  onUnsaved,
  selectable,
  selected,
  onSelect,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liked, setLiked] = useState(resource.likedByMe);
  const [saved, setSaved] = useState(resource.savedByMe);
  const [likeCount, setLikeCount] = useState(resource.likeCount ?? 0);
  const [saveCount, setSaveCount] = useState(resource.saveCount ?? 0);

  const [reposted, setReposted] = useState(resource.repostedByMe);
  const [repostCount, setRepostCount] = useState(resource.repostCount ?? 0);

  const initials = useMemo(() => {
    const name = resource.ownerName?.trim() || "";
    if (!name) return "?";
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + second).toUpperCase();
  }, [resource.ownerName]);

  const createdLabel = useMemo(() => {
    try {
      return new Date(resource.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, [resource.createdAt]);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");

    try {
      if (liked) {
        await client.delete(`/api/resources/${resource.id}/like`);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await client.post(`/api/resources/${resource.id}/like`);
        setLikeCount((c) => c + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");

    try {
      if (saved) {
        await client.delete(`/api/resources/${resource.id}/save`);
        setSaveCount((c) => Math.max(0, c - 1));
        if (onUnsaved) onUnsaved(resource.id);
      } else {
        await client.post(`/api/resources/${resource.id}/save`);
        setSaveCount((c) => c + 1);
      }
      setSaved(!saved);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRepost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    if (resource.ownerId === user.id) return;

    try {
      if (reposted) {
        await client.delete(`/api/reposts/${resource.id}`);
        setRepostCount((c) => Math.max(0, c - 1));
      } else {
        await client.post(`/api/reposts/${resource.id}`);
        setRepostCount((c) => c + 1);
      }
      setReposted(!reposted);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-w-0">
      {selectable && (
        <button
          onClick={() => onSelect && onSelect(resource.id)}
          className={`absolute inset-0 z-10 rounded-2xl border-2 transition cursor-pointer ${
            selected
              ? "border-blue-500 bg-blue-500/10"
              : "border-transparent hover:border-blue-500/40 hover:bg-blue-500/5"
          }`}
          type="button"
        >
          <div
            className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
              selected
                ? "border-blue-500 bg-blue-500"
                : "border-gray-600 bg-gray-900"
            }`}
          >
            {selected && <CheckCircle2 size={14} className="text-white" />}
          </div>
        </button>
      )}

      <div
        className={`min-w-0 overflow-hidden rounded-2xl border bg-gray-900/80 shadow-sm transition-all duration-300 group hover:bg-gray-900 hover:shadow-lg hover:shadow-black/30 ${
          selected
            ? "border-blue-500/50"
            : "border-gray-800 hover:border-gray-700"
        }`}
      >
        {resource.coverImage && (
          <Link to={`/resources/${resource.id}`} className="block cursor-pointer">
            <img
              src={resource.coverImage}
              alt={resource.title}
              className="h-40 w-full object-cover transition group-hover:opacity-95 sm:h-44"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="h-px bg-gray-800" />
          </Link>
        )}

        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  to={`/users/${resource.ownerId}`}
                  className="flex min-w-0 items-center gap-2.5 transition hover:opacity-95 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white ring-1 ring-blue-500/30">
                    {initials}
                  </div>
                  <span className="truncate text-sm text-gray-300 transition hover:text-white">
                    {resource.ownerName}
                  </span>
                </Link>

                {createdLabel && (
                  <>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="shrink-0 text-xs text-gray-600">
                      {createdLabel}
                    </span>
                  </>
                )}
              </div>
            </div>

            {resource.type && (
              <div className="shrink-0">
                <span
                  className={`inline-flex max-w-full items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${
                    TYPE_COLORS[resource.type] ||
                    "border-gray-700/50 bg-gray-800 text-gray-400"
                  }`}
                >
                  {TYPE_LABELS[resource.type] || resource.type}
                </span>
              </div>
            )}
          </div>

          {/* Series */}
          {resource.seriesSlug && (
            <Link
              to={`/series/${resource.seriesSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="mb-2 inline-flex max-w-full items-center gap-1 rounded-xl border border-purple-500/25 bg-purple-600/15 px-2.5 py-1 text-xs text-purple-400 transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-600/25 cursor-pointer"
            >
              <span className="shrink-0">📚 Part {resource.seriesPartNumber} •</span>
              <span className="truncate max-w-[16rem] sm:max-w-[20rem]">
                {resource.seriesTitle}
              </span>
            </Link>
          )}

          {/* Title */}
          <Link to={`/resources/${resource.id}`} className="block cursor-pointer">
            <h3 className="mb-1.5 line-clamp-2 break-words text-base font-semibold leading-snug text-white transition group-hover:text-blue-400">
              {resource.title}
            </h3>
          </Link>

          {/* Description */}
          {resource.description && (
            <p className="mb-3 line-clamp-2 break-words text-sm leading-relaxed text-gray-400/90">
              {resource.description}
            </p>
          )}

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/explore?tag=${tag}`);
                  }}
                  className="cursor-pointer rounded-lg border border-gray-700/40 bg-gray-800/70 px-2.5 py-1 text-xs text-blue-400 transition-all duration-200 hover:border-gray-700 hover:bg-gray-800 active:scale-95 break-all"
                  type="button"
                >
                  #{tag}
                </button>
              ))}
              {resource.tags.length > 4 && (
                <span className="cursor-default px-2.5 py-1 text-xs text-gray-600">
                  +{resource.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-1 border-t border-gray-800 pt-3">
            <div className="flex flex-col gap-3 sm:gap-3">
              {/* top row on mobile / left row on desktop */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={toggleLike}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all duration-200 active:scale-95 ${
                    liked
                      ? "border-red-500/30 bg-red-500/10 text-red-300 shadow-sm shadow-red-500/20"
                      : "border-gray-800 bg-gray-950/40 text-gray-400 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-300 hover:shadow-sm hover:shadow-red-500/20"
                  }`}
                  title="Like"
                  type="button"
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={toggleSave}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all duration-200 active:scale-95 ${
                    saved
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-sm shadow-blue-500/20"
                      : "border-gray-800 bg-gray-950/40 text-gray-400 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300 hover:shadow-sm hover:shadow-blue-500/20"
                  }`}
                  title="Save"
                  type="button"
                >
                  <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
                  <span>{saveCount}</span>
                </button>

                {user?.id !== resource.ownerId && (
                  <button
                    onClick={toggleRepost}
                    className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all duration-200 active:scale-95 ${
                      reposted
                        ? "border-green-500/30 bg-green-500/10 text-green-400 shadow-sm shadow-green-500/20"
                        : "border-gray-800 bg-gray-950/40 text-gray-400 hover:border-green-500/30 hover:bg-green-500/5 hover:text-green-400 hover:shadow-sm hover:shadow-green-500/20"
                    }`}
                    title="Repost"
                    type="button"
                  >
                    <Repeat2 size={14} />
                    <span>{repostCount}</span>
                  </button>
                )}

                {resource.viewCount > 0 && (
                  <span className="inline-flex cursor-default items-center gap-1 rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-1 text-xs text-gray-500">
                    <Eye size={13} />
                    {resource.viewCount}
                  </span>
                )}
              </div>

              {/* right actions */}
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {resource.type === "WRITTEN_POST" &&
                  resource.readTimeMinutes > 0 && (
                    <span className="inline-flex cursor-default items-center gap-1 rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {resource.readTimeMinutes} min
                    </span>
                  )}

                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-600/10 px-2.5 py-1 text-xs text-blue-300 transition-all duration-200 hover:border-blue-500/35 hover:bg-blue-600/15 active:scale-95"
                  >
                    Visit
                    <ExternalLink size={11} />
                  </a>
                )}

                {footerRight && <div className="flex flex-wrap">{footerRight}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}