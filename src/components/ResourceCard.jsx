import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import { Bookmark, Heart, ExternalLink, Clock, Eye, Repeat2, CheckCircle2 } from "lucide-react";

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

export default function ResourceCard({ resource, footerRight, onUnsaved, selectable, selected, onSelect }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liked, setLiked] = useState(resource.likedByMe);
  const [saved, setSaved] = useState(resource.savedByMe);
  const [likeCount, setLikeCount] = useState(resource.likeCount);
  const [saveCount, setSaveCount] = useState(resource.saveCount);

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
    if (resource.ownerId === user.id) return; // can't repost own

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
    <div className="relative">
      {/* Selection overlay */}
      {selectable && (
        <button
          onClick={() => onSelect && onSelect(resource.id)}
          className={`absolute inset-0 z-10 rounded-2xl border-2 transition cursor-pointer ${
            selected
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-transparent hover:border-blue-500/40 hover:bg-blue-500/5'
          }`}
        >
          <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
            selected
              ? 'bg-blue-500 border-blue-500'
              : 'bg-gray-900 border-gray-600'
          }`}>
            {selected && <CheckCircle2 size={14} className="text-white" />}
          </div>
        </button>
      )}
    <div className={`bg-gray-900/80 border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group hover:bg-gray-900 hover:shadow-lg hover:shadow-black/30 ${
      selected ? 'border-blue-500/50' : 'border-gray-800 hover:border-gray-700'
    }`}>
      {/* Cover */}
      {resource.coverImage && (
        <Link to={`/resources/${resource.id}`} className="block cursor-pointer">
          <img
            src={resource.coverImage}
            alt={resource.title}
            className="w-full h-44 object-cover transition group-hover:opacity-95"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="h-px bg-gray-800" />
        </Link>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <Link
            to={`/users/${resource.ownerId}`}
            className="flex items-center gap-2.5 min-w-0 transition hover:opacity-95 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-1 ring-blue-500/30">
              {initials}
            </div>
            <span className="text-gray-300 text-sm transition hover:text-white truncate">
              {resource.ownerName}
            </span>
          </Link>

          {createdLabel && (
            <>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-gray-600 text-xs shrink-0">
                {createdLabel}
              </span>
            </>
          )}

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {resource.type && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  TYPE_COLORS[resource.type] ||
                  "bg-gray-800 text-gray-400 border-gray-700/50"
                }`}
              >
                {TYPE_LABELS[resource.type] || resource.type}
              </span>
            )}
          </div>
        </div>

        {/* Series */}
        {resource.seriesSlug && (
          <Link
            to={`/series/${resource.seriesSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/15 text-purple-400 text-xs rounded-xl border border-purple-500/25 mb-2 transition-all duration-200 hover:bg-purple-600/25 hover:border-purple-500/40 cursor-pointer"
          >
            📚 Part {resource.seriesPartNumber} •{" "}
            <span className="truncate max-w-[18rem]">{resource.seriesTitle}</span>
          </Link>
        )}

        {/* Title */}
        <Link to={`/resources/${resource.id}`} className="block cursor-pointer">
          <h3 className="text-white font-semibold text-base mb-1.5 leading-snug line-clamp-2 transition group-hover:text-blue-400">
            {resource.title}
          </h3>
        </Link>

        {/* Description */}
        {resource.description && (
          <p className="text-gray-400/90 text-sm mb-3 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {resource.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/explore?tag=${tag}`);
                }}
                className="cursor-pointer px-2.5 py-1 bg-gray-800/70 text-blue-400 text-xs rounded-lg border border-gray-700/40 transition-all duration-200 hover:bg-gray-800 hover:border-gray-700 active:scale-95"
              >
                #{tag}
              </button>
            ))}
            {resource.tags.length > 4 && (
              <span className="px-2.5 py-1 text-gray-600 text-xs cursor-default">
                +{resource.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-gray-800 mt-1">
          {/* Like */}
          <button
            onClick={toggleLike}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all duration-200 active:scale-95 ${
              liked
                ? "bg-red-500/10 border-red-500/30 text-red-300 shadow-sm shadow-red-500/20"
                : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/5 hover:shadow-sm hover:shadow-red-500/20"
            }`}
            title="Like"
            type="button"
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>

          {/* Save */}
          <button
            onClick={toggleSave}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all duration-200 active:scale-95 ${
              saved
                ? "bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-sm shadow-blue-500/20"
                : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-blue-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-sm hover:shadow-blue-500/20"
            }`}
            title="Save"
            type="button"
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
            <span>{saveCount}</span>
          </button>

          {/* Repost - only show if not owner */}
          {user?.id !== resource.ownerId && (
            <button
              onClick={toggleRepost}
              className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all duration-200 active:scale-95 ${
                reposted
                  ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-sm shadow-green-500/20"
                  : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5 hover:shadow-sm hover:shadow-green-500/20"
              }`}
              title="Repost"
              type="button"
            >
              <Repeat2 size={14} />
              <span className="text-xs">{repostCount}</span>
            </button>
          )}

          {/* Views */}
          {resource.viewCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-950/40 border border-gray-800 rounded-lg text-gray-500 text-xs cursor-default">
              <Eye size={13} /> {resource.viewCount}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2.5">
            {/* Read time */}
            {resource.type === "WRITTEN_POST" && resource.readTimeMinutes > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-950/40 border border-gray-800 rounded-lg text-gray-500 text-xs cursor-default">
                <Clock size={12} /> {resource.readTimeMinutes} min
              </span>
            )}

            {/* External link */}
            {resource.link && (
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-500/20 bg-blue-600/10 text-blue-300 text-xs transition-all duration-200 hover:bg-blue-600/15 hover:border-blue-500/35 active:scale-95"
              >
                Visit <ExternalLink size={11} />
              </a>
            )}

            {footerRight}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}