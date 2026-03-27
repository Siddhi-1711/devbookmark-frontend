import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import { usePageTitle } from "../hooks/usePageTitle";

import {
  Repeat2,
  Heart,
  Bookmark,
  Send,
  Trash2,
  ArrowLeft,
  Pencil,
  FolderOpen,
  Plus,
  BookOpen,
  Eye,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  usePageTitle(resource?.title);
  const [seriesCtx, setSeriesCtx] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);

  useEffect(() => {
    fetchResource();
    fetchComments();
    trackView();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await client.get(`/api/resources/${id}`);
      const r = res.data;
      setResource(r);
      setLiked(!!r.likedByMe);
      setSaved(!!r.savedByMe);
      setLikeCount(r.likeCount ?? 0);
      setSaveCount(r.saveCount ?? 0);
      setReposted(!!r.repostedByMe);
      setRepostCount(r.repostCount ?? 0);

      if (r.seriesSlug) {
        try {
          const ctxRes = await client.get(`/api/series/${r.seriesSlug}/context/${r.id}`);
          setSeriesCtx(ctxRes.data);
        } catch {
          setSeriesCtx(null);
        }
      } else {
        setSeriesCtx(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await client.get(`/api/resources/${id}/comments`);
      setComments(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const trackView = async () => {
    try {
      await client.post(`/api/resources/${id}/view`);
    } catch {}
  };

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await client.delete(`/api/resources/${id}/like`);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await client.post(`/api/resources/${id}/like`);
      setLikeCount((c) => c + 1);
    }
    setLiked((v) => !v);
  };

  const toggleSave = async () => {
    if (!user) return;
    if (saved) {
      await client.delete(`/api/resources/${id}/save`);
      setSaveCount((c) => Math.max(0, c - 1));
    } else {
      await client.post(`/api/resources/${id}/save`);
      setSaveCount((c) => c + 1);
    }
    setSaved((v) => !v);
  };

  const toggleRepost = async () => {
    if (!user || user.id === resource.ownerId) return;
    try {
      if (reposted) {
        await client.delete(`/api/reposts/${id}`);
        setRepostCount((c) => Math.max(0, c - 1));
      } else {
        await client.post(`/api/reposts/${id}`);
        setRepostCount((c) => c + 1);
      }
      setReposted((v) => !v);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await client.delete(`/api/resources/${id}`);
      navigate(-1);
    } catch {
      alert("Failed to delete");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await client.post(`/api/resources/${id}/comments`, { text: commentText });
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await client.delete(`/api/resources/${id}/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="mx-auto max-w-3xl space-y-4 px-4 pt-24 animate-pulse">
          <div className="h-6 w-24 rounded bg-gray-800" />
          <div className="h-56 rounded-xl bg-gray-800 sm:h-72" />
          <div className="h-8 w-3/4 rounded bg-gray-800" />
          <div className="h-4 w-1/2 rounded bg-gray-800" />
        </div>
      </div>
    );

  if (!resource)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="px-4 pt-32 text-center text-gray-400">Resource not found</div>
      </div>
    );

  const isOwner = user?.id === resource.ownerId;

  const rawFileUrl = resource?.fileUrl || "";
  const fileUrl = rawFileUrl.replace("/raw/upload/fl_inline/", "/raw/upload/");
  const ct = (resource?.fileContentType || "").toLowerCase();
  const name = (resource?.fileName || "").toLowerCase();

  const isPdf = ct.includes("pdf") || name.endsWith(".pdf");
  const isDoc =
    ct.includes("msword") ||
    ct.includes("wordprocessingml") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx");
  const isTxt = ct.includes("text/plain") || name.endsWith(".txt");

  const backendBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const viewUrl = `${backendBase}/api/files/resource/${id}/view`;
  const downloadUrl = `${backendBase}/api/files/resource/${id}/download`;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-20 sm:px-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Cover Image */}
        {resource.coverImage && (
          <img
            src={resource.coverImage}
            alt={resource.title}
            className="mb-6 h-52 w-full rounded-2xl object-cover shadow-xl sm:mb-8 sm:h-72"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        {/* Series Navigation */}
        {resource.seriesSlug && seriesCtx && (
          <div className="mb-6 rounded-xl border border-purple-600/25 bg-purple-600/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to={`/series/${seriesCtx.seriesSlug}`}
                className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-purple-300 transition hover:text-purple-200"
              >
                <span className="shrink-0">📚 {seriesCtx.seriesTitle}</span>
                <span className="text-purple-500 font-normal">
                  · Part {seriesCtx.partNumber}
                </span>
              </Link>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                {seriesCtx.prevResourceId && (
                  <Link
                    to={`/resources/${seriesCtx.prevResourceId}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition hover:text-white"
                  >
                    <ChevronLeft size={13} />
                    Part {seriesCtx.prevPartNumber}
                  </Link>
                )}

                {seriesCtx.nextResourceId && (
                  <Link
                    to={`/resources/${seriesCtx.nextResourceId}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-purple-600/30 bg-purple-600/20 px-3 py-1.5 text-xs text-purple-300 transition hover:text-purple-200"
                  >
                    Part {seriesCtx.nextPartNumber}
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 break-words text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
          {resource.title}
        </h1>

        {/* Author + Meta row */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={`/users/${resource.ownerId}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white transition hover:ring-2 hover:ring-blue-500">
                {resource.ownerName?.[0]?.toUpperCase()}
              </div>
            </Link>

            <div className="min-w-0">
              <Link
                to={`/users/${resource.ownerId}`}
                className="block truncate text-sm font-semibold text-white transition hover:text-blue-400"
              >
                {resource.ownerName}
              </Link>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>
                  {new Date(resource.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>

                {resource.readTimeMinutes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} />
                    {resource.readTimeMinutes} min read
                  </span>
                )}

                {resource.viewCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Eye size={11} />
                    {resource.viewCount} views
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="mb-5 break-words text-base leading-relaxed text-gray-400">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${tag}`}
                className="rounded-full bg-gray-800 px-3 py-1 text-sm text-blue-400 transition hover:bg-gray-700 break-all"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Attached File */}
        {resource.fileUrl && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={async () => {
                try {
                  const res = await client.get(`/api/files/resource/${id}/view`, {
                    responseType: "blob",
                  });
                  const blobUrl = URL.createObjectURL(res.data);
                  window.open(blobUrl, "_blank");
                } catch {
                  alert("Could not open file.");
                }
              }}
              className="inline-flex w-full items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-left text-sm text-gray-300 transition group hover:border-blue-500 hover:text-white sm:w-auto"
            >
              <span className="text-xl shrink-0">
                {isPdf ? "📕" : isDoc ? "📘" : isTxt ? "📄" : "📎"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium transition group-hover:text-blue-400">View File</p>
                <p className="text-xs text-gray-500">Opens in browser</p>
              </div>
              <ExternalLink
                size={14}
                className="ml-auto shrink-0 text-gray-500 transition group-hover:text-blue-400"
              />
            </button>

            <button
              onClick={async () => {
                try {
                  const res = await client.get(`/api/files/resource/${id}/download`, {
                    responseType: "blob",
                  });
                  const blobUrl = URL.createObjectURL(res.data);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = resource.fileName || "file";
                  a.click();
                  URL.revokeObjectURL(blobUrl);
                } catch {
                  alert("Could not download file.");
                }
              }}
              className="inline-flex w-full items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-left text-sm text-gray-300 transition group hover:border-green-500 hover:text-white sm:w-auto"
            >
              <span className="text-xl shrink-0">⬇️</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium transition group-hover:text-green-400">Download</p>
                <p className="text-xs text-gray-500">Save to device</p>
              </div>
            </button>
          </div>
        )}

        {/* Action bar */}
        <div className="sticky top-14 z-20 mb-8">
          <div className="rounded-xl border border-gray-800 bg-gray-950/90 px-3 py-3 backdrop-blur sm:px-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleLike}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    liked
                      ? "bg-red-400/10 text-red-400"
                      : "text-gray-500 hover:bg-red-400/10 hover:text-red-400"
                  }`}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>

                <button
                  onClick={toggleSave}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    saved
                      ? "bg-blue-400/10 text-blue-400"
                      : "text-gray-500 hover:bg-blue-400/10 hover:text-blue-400"
                  }`}
                >
                  <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                  {saveCount}
                </button>

                {user && user.id !== resource.ownerId && (
                  <button
                    onClick={toggleRepost}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                      reposted
                        ? "bg-green-400/10 text-green-400"
                        : "text-gray-500 hover:bg-green-400/10 hover:text-green-400"
                    }`}
                  >
                    <Repeat2 size={16} />
                    {repostCount}
                  </button>
                )}

                {user && <AddToReadingListButton resourceId={id} />}
                {user && <AddToCollectionButton resourceId={id} />}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700"
                  >
                    Visit
                    <ExternalLink size={13} />
                  </a>
                )}

                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    copied
                      ? "bg-green-400/10 text-green-400"
                      : "text-gray-500 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy link
                    </>
                  )}
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/resources/${id}/edit`)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-800 hover:text-white"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-red-400/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {resource.content && (
          <div className="mb-10">
            <div
              className="max-w-none overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-300 sm:p-6 md:p-10
              [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white sm:[&_h1]:text-3xl
              [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white sm:[&_h2]:text-2xl
              [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white sm:[&_h3]:text-xl
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
              [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6
              [&_li]:text-gray-300
              [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-400
              [&_code]:rounded [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-blue-300
              [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-gray-800 [&_pre]:p-5
              [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-300
              [&_strong]:font-semibold [&_strong]:text-white
              [&_mark]:rounded [&_mark]:bg-yellow-400/20 [&_mark]:px-1 [&_mark]:text-yellow-200
              [&_hr]:my-6 [&_hr]:border-gray-700
              [&_img]:max-w-full [&_img]:rounded-xl
              [&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse
              [&_td]:border [&_td]:border-gray-700 [&_td]:p-2 [&_td]:text-gray-300
              [&_th]:border [&_th]:border-gray-700 [&_th]:bg-gray-800 [&_th]:p-2 [&_th]:font-semibold [&_th]:text-white"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </div>
        )}

        {/* Author card */}
        <div className="mb-10 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link to={`/users/${resource.ownerId}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white transition hover:ring-2 hover:ring-blue-500">
                  {resource.ownerName?.[0]?.toUpperCase()}
                </div>
              </Link>

              <div className="min-w-0">
                <Link
                  to={`/users/${resource.ownerId}`}
                  className="block truncate font-semibold text-white transition hover:text-blue-400"
                >
                  {resource.ownerName}
                </Link>
                <p className="text-sm text-gray-500">Published this resource</p>
              </div>
            </div>

            {user && user.id !== resource.ownerId && (
              <Link
                to={`/users/${resource.ownerId}`}
                className="inline-flex w-full items-center justify-center rounded-lg border border-blue-600/30 bg-blue-600/20 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-600/30 sm:w-auto"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h2 className="mb-5 text-xl font-bold text-white">
            Comments{" "}
            <span className="text-base font-normal text-gray-600">({comments.length})</span>
          </h2>

          {user ? (
            <form onSubmit={submitComment} className="mb-6 flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white transition focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-sm text-gray-400">
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>{" "}
                to leave a comment
              </p>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="py-10 text-center text-gray-600">
                <p>No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  resourceId={id}
                  onDelete={deleteComment}
                  onReply={fetchComments}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, resourceId, onDelete, onReply }) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await client.post(`/api/resources/${resourceId}/comments`, {
        text: replyText,
        parentId: comment.id,
      });
      setReplyText("");
      setShowReply(false);
      onReply();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-3">
      <Link to={`/users/${comment.userId}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white transition hover:ring-2 hover:ring-gray-600">
          {comment.userName?.[0]?.toUpperCase()}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Link
                to={`/users/${comment.userId}`}
                className="truncate text-sm font-semibold text-white transition hover:text-blue-400"
              >
                {comment.userName}
              </Link>
              <span className="text-xs text-gray-600">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {comment.mine && (
              <button
                onClick={() => onDelete(comment.id)}
                className="self-start text-gray-600 transition hover:text-red-400 sm:self-auto"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <p className="break-words text-sm leading-relaxed text-gray-300">{comment.text}</p>
        </div>

        {user && (
          <button
            onClick={() => setShowReply((v) => !v)}
            className="ml-3 mt-1.5 text-xs text-gray-600 transition hover:text-blue-400"
          >
            {showReply ? "Cancel" : "Reply"}
          </button>
        )}

        {showReply && (
          <form onSubmit={submitReply} className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              autoFocus
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700"
            >
              Reply
            </button>
          </form>
        )}

        {comment.replies?.length > 0 && (
          <div className="ml-2 mt-3 space-y-2 border-l-2 border-gray-800 pl-3 sm:ml-4 sm:pl-4">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                  {reply.userName?.[0]?.toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2">
                  <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="truncate text-xs font-semibold text-white">
                      {reply.userName}
                    </span>

                    {reply.mine && (
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="self-start text-gray-600 transition hover:text-red-400 sm:self-auto"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  <p className="break-words text-xs leading-relaxed text-gray-300">
                    {reply.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddToCollectionButton({ resourceId }) {
  const [collections, setCollections] = useState([]);
  const [savedTo, setSavedTo] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = async () => {
    try {
      const res = await client.get("/api/collections/me");
      const cols = res.data || [];
      setCollections(cols);

      const saved = [];
      for (const c of cols) {
        try {
          const detail = await client.get(`/api/collections/${c.id}`);
          const items = detail.data?.items || [];
          if (items.some((item) => item.resourceId === resourceId)) saved.push(c.id);
        } catch {}
      }
      setSavedTo(saved);
    } catch {}
  };

  const toggle = async () => {
    if (!showMenu) await fetchCollections();
    setShowMenu((v) => !v);
    setShowCreate(false);
  };

  const addTo = async (collectionId) => {
    if (savedTo.includes(collectionId)) return;
    setLoading(true);
    try {
      await client.post(`/api/collections/${collectionId}/resources/${resourceId}`);
      setSavedTo((prev) => [...prev, collectionId]);
      setShowMenu(false);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await client.post("/api/collections", {
        name: newName.trim(),
        description: "",
        isPublic: true,
      });
      await client.post(`/api/collections/${res.data.id}/resources/${resourceId}`);
      setCollections((prev) => [res.data, ...prev]);
      setSavedTo((prev) => [...prev, res.data.id]);
      setShowCreate(false);
      setNewName("");
      setShowMenu(false);
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const firstSaved = collections.find((c) => savedTo.includes(c.id));

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
          firstSaved
            ? "bg-green-400/10 text-green-400"
            : "text-gray-500 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <FolderOpen size={15} />
        <span className="max-w-[10rem] truncate">
          {firstSaved ? `In '${firstSaved.name}'` : "Collect"}
        </span>
      </button>

      {showMenu && (
        <div className="absolute left-0 top-10 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          {collections.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No collections yet</div>
          ) : (
            collections.map((c) => (
              <button
                key={c.id}
                onClick={() => addTo(c.id)}
                disabled={loading || savedTo.includes(c.id)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                  savedTo.includes(c.id)
                    ? "cursor-default bg-green-500/5 text-green-400"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="truncate pr-2">{c.name}</span>
                {savedTo.includes(c.id) && <Check size={14} className="shrink-0" />}
              </button>
            ))
          )}

          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex w-full items-center gap-2 border-t border-gray-800 px-4 py-2.5 text-left text-sm text-blue-400 transition hover:bg-gray-800"
            >
              <Plus size={14} />
              New Collection
            </button>
          ) : (
            <form onSubmit={createAndAdd} className="border-t border-gray-800 p-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name..."
                autoFocus
                className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition hover:bg-blue-700"
                >
                  {creating ? "Creating..." : "Create & Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function AddToReadingListButton({ resourceId }) {
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfInList();
  }, [resourceId]);

  const checkIfInList = async () => {
    try {
      const res = await client.get("/api/reading-list");
      const items = res.data.content || [];
      setInList(items.some((item) => item.resource.id === resourceId));
    } catch {}
  };

  const toggle = async () => {
    setLoading(true);
    try {
      if (inList) {
        await client.delete(`/api/reading-list/${resourceId}`);
        setInList(false);
      } else {
        await client.post(`/api/reading-list/${resourceId}`);
        setInList(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
        inList
          ? "bg-green-400/10 text-green-400 hover:bg-red-400/10 hover:text-red-400"
          : "text-gray-500 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <BookOpen size={15} />
      {inList ? "Reading List" : "Read Later"}
    </button>
  );
}