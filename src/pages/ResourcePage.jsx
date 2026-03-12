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
const [reposted, setReposted] = useState(false)
const [repostCount, setRepostCount] = useState(0)

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
      setReposted(!!r.repostedByMe)
      setRepostCount(r.repostCount ?? 0)
      if (r.seriesSlug) {
        try {
          const ctxRes = await client.get(`/api/series/${r.seriesSlug}/context/${r.id}`);
          setSeriesCtx(ctxRes.data);
        } catch { setSeriesCtx(null); }
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
    } catch (err) { console.error(err); }
  };

  const trackView = async () => {
    try { await client.post(`/api/resources/${id}/view`); } catch {}
  };

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await client.delete(`/api/resources/${id}/like`);
      setLikeCount(c => c - 1);
    } else {
      await client.post(`/api/resources/${id}/like`);
      setLikeCount(c => c + 1);
    }
    setLiked(v => !v);
  };

  const toggleSave = async () => {
    if (!user) return;
    if (saved) {
      await client.delete(`/api/resources/${id}/save`);
      setSaveCount(c => c - 1);
    } else {
      await client.post(`/api/resources/${id}/save`);
      setSaveCount(c => c + 1);
    }
    setSaved(v => !v);
  };
const toggleRepost = async () => {
  if (!user || user.id === resource.ownerId) return
  try {
    if (reposted) {
      await client.delete(`/api/reposts/${id}`)
      setRepostCount(c => Math.max(0, c - 1))
    } else {
      await client.post(`/api/reposts/${id}`)
      setRepostCount(c => c + 1)
    }
    setReposted(v => !v)
  } catch (err) { console.error(err) }
}
  const handleDelete = async () => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await client.delete(`/api/resources/${id}`);
      navigate(-1);
    } catch { alert('Failed to delete'); }
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
    } catch (err) { console.error(err); }
  };

  const deleteComment = async (commentId) => {
    try {
      await client.delete(`/api/resources/${id}/comments/${commentId}`);
      fetchComments();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-24" />
        <div className="h-72 bg-gray-800 rounded-xl" />
        <div className="h-8 bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );

  if (!resource) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="text-center text-gray-400 pt-32">Resource not found</div>
    </div>
  );

  const isOwner = user?.id === resource.ownerId;
  // ---- File URL helpers (fix old Cloudinary fl_inline URLs + better preview) ----
  const rawFileUrl = resource?.fileUrl || "";
  const fileUrl = rawFileUrl.replace("/raw/upload/fl_inline/", "/raw/upload/"); // ✅ fixes old saved URLs
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
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-20">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Cover Image */}
        {resource.coverImage && (
          <img src={resource.coverImage} alt={resource.title}
            className="w-full h-72 object-cover rounded-2xl mb-8 shadow-xl"
            onError={e => e.target.style.display = 'none'} />
        )}

        {/* Series Navigation */}
        {resource.seriesSlug && seriesCtx && (
          <div className="bg-purple-600/10 border border-purple-600/25 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <Link to={`/series/${seriesCtx.seriesSlug}`}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium text-sm transition">
                📚 {seriesCtx.seriesTitle}
                <span className="text-purple-500 font-normal">· Part {seriesCtx.partNumber}</span>
              </Link>
              <div className="flex gap-2 shrink-0">
                {seriesCtx.prevResourceId && (
                  <Link to={`/resources/${seriesCtx.prevResourceId}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs transition">
                    <ChevronLeft size={13} /> Part {seriesCtx.prevPartNumber}
                  </Link>
                )}
                {seriesCtx.nextResourceId && (
                  <Link to={`/resources/${seriesCtx.nextResourceId}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-300 hover:text-purple-200 text-xs transition">
                    Part {seriesCtx.nextPartNumber} <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          {resource.title}
        </h1>

        {/* Author + Meta row */}
        <div className="flex items-center gap-3 mb-5">
          <Link to={`/users/${resource.ownerId}`}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-blue-500 transition">
              {resource.ownerName?.[0]?.toUpperCase()}
            </div>
          </Link>
          <div className="flex-1">
            <Link to={`/users/${resource.ownerId}`}
              className="text-white text-sm font-semibold hover:text-blue-400 transition">
              {resource.ownerName}
            </Link>
            <div className="flex items-center gap-3 text-gray-500 text-xs mt-0.5">
              <span>{new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              {resource.readTimeMinutes > 0 && (
                <span className="flex items-center gap-1"><Clock size={11} /> {resource.readTimeMinutes} min read</span>
              )}
              {resource.viewCount > 0 && (
                <span className="flex items-center gap-1"><Eye size={11} /> {resource.viewCount} views</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-gray-400 text-base leading-relaxed mb-5">{resource.description}</p>
        )}

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {resource.tags.map(tag => (
              <Link key={tag} to={`/explore?tag=${tag}`}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-blue-400 text-sm rounded-full transition">
                #{tag}
              </Link>
            ))}
          </div>
        )}

                {/* Attached File */}
                {/* Attached File */}
                {resource.fileUrl && (
                  <div className="mb-6 flex gap-3 flex-wrap">
                    {/* VIEW */}
                    <button
                      onClick={async () => {
                        try {
                          const res = await client.get(`/api/files/resource/${id}/view`, { responseType: 'blob' });
                          const blobUrl = URL.createObjectURL(res.data);
                          window.open(blobUrl, '_blank');
                        } catch {
                          alert('Could not open file.');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white rounded-xl text-sm transition group"
                    >
                      <span className="text-xl">
                        {isPdf ? "📕" : isDoc ? "📘" : isTxt ? "📄" : "📎"}
                      </span>
                      <div>
                        <p className="font-medium group-hover:text-blue-400 transition">View File</p>
                        <p className="text-xs text-gray-500">Opens in browser</p>
                      </div>
                      <ExternalLink size={14} className="ml-2 text-gray-500 group-hover:text-blue-400 transition" />
                    </button>

                    {/* DOWNLOAD */}
                    {/* DOWNLOAD */}
                    <button
                      onClick={async () => {
                        try {
                          const res = await client.get(`/api/files/resource/${id}/download`, { responseType: 'blob' });
                          const blobUrl = URL.createObjectURL(res.data);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          a.download = resource.fileName || 'file';
                          a.click();
                          URL.revokeObjectURL(blobUrl);
                        } catch {
                          alert('Could not download file.');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-green-500 text-gray-300 hover:text-white rounded-xl text-sm transition group"
                    >
                      <span className="text-xl">⬇️</span>
                      <div>
                        <p className="font-medium group-hover:text-green-400 transition">Download</p>
                        <p className="text-xs text-gray-500">Save to device</p>
                      </div>
                    </button>
                  </div>
                )}
        {/* Action bar */}
        <div className="sticky top-14 z-20 mb-8">
          <div className="bg-gray-950/90 backdrop-blur border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">

            {/* Like */}
            <button onClick={toggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                liked ? 'bg-red-400/10 text-red-400' : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
              }`}>
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
            </button>

            {/* Save */}
            <button onClick={toggleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                saved ? 'bg-blue-400/10 text-blue-400' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-400/10'
              }`}>
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saveCount}
            </button>
            {user && user.id !== resource.ownerId && (
              <button onClick={toggleRepost}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  reposted
                    ? 'bg-green-400/10 text-green-400'
                    : 'text-gray-500 hover:text-green-400 hover:bg-green-400/10'
                }`}>
                <Repeat2 size={16} /> {repostCount}
              </button>
            )}
            {user && <AddToReadingListButton resourceId={id} />}
            {user && <AddToCollectionButton resourceId={id} />}

            <div className="ml-auto flex items-center gap-2">
              {/* Visit link */}
              {resource.link && (
                <a href={resource.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition">
                  Visit <ExternalLink size={13} />
                </a>
              )}

              {/* Copy link */}
              <button onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  copied ? 'bg-green-400/10 text-green-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'
                }`}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
              </button>

              {/* Owner actions */}
              {isOwner && (
                <>
                  <button onClick={() => navigate(`/resources/${id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 text-sm transition">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 text-sm transition">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {resource.content && (
          <div className="mb-10">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 md:p-10 text-gray-300 leading-relaxed text-[15px]
              max-w-none
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-4 [&_h1]:mt-6
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-3 [&_h2]:mt-5
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mb-2 [&_h3]:mt-4
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
              [&_li]:text-gray-300
              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-4
              [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-blue-300 [&_code]:text-sm [&_code]:font-mono
              [&_pre]:bg-gray-800 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:mb-4 [&_pre]:overflow-x-auto
              [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-300
              [&_strong]:text-white [&_strong]:font-semibold
              [&_mark]:bg-yellow-400/20 [&_mark]:text-yellow-200 [&_mark]:rounded [&_mark]:px-1
              [&_hr]:border-gray-700 [&_hr]:my-6
              [&_img]:rounded-xl [&_img]:max-w-full
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
              [&_td]:border [&_td]:border-gray-700 [&_td]:p-2 [&_td]:text-gray-300
              [&_th]:border [&_th]:border-gray-700 [&_th]:p-2 [&_th]:bg-gray-800 [&_th]:font-semibold [&_th]:text-white
              "

              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </div>
        )}

        {/* Author card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/users/${resource.ownerId}`}>
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold hover:ring-2 hover:ring-blue-500 transition">
                {resource.ownerName?.[0]?.toUpperCase()}
              </div>
            </Link>
            <div>
              <Link to={`/users/${resource.ownerId}`}
                className="text-white font-semibold hover:text-blue-400 transition">
                {resource.ownerName}
              </Link>
              <p className="text-gray-500 text-sm">Published this resource</p>
            </div>
          </div>
          {user && user.id !== resource.ownerId && (
            <Link to={`/users/${resource.ownerId}`}
              className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 text-sm rounded-lg transition">
              View Profile
            </Link>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-white font-bold text-xl mb-5">
            Comments <span className="text-gray-600 font-normal text-base">({comments.length})</span>
          </h2>

          {user ? (
            <form onSubmit={submitComment} className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text" value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
                  <Send size={15} />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 text-center">
              <p className="text-gray-400 text-sm">
                <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link> to leave a comment
              </p>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <p>No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment}
                  resourceId={id} onDelete={deleteComment} onReply={fetchComments} />
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
        text: replyText, parentId: comment.id,
      });
      setReplyText("");
      setShowReply(false);
      onReply();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex gap-3">
      <Link to={`/users/${comment.userId}`}>
        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0 hover:ring-2 hover:ring-gray-600 transition">
          {comment.userName?.[0]?.toUpperCase()}
        </div>
      </Link>

      <div className="flex-1">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link to={`/users/${comment.userId}`}
                className="text-white text-sm font-semibold hover:text-blue-400 transition">
                {comment.userName}
              </Link>
              <span className="text-gray-600 text-xs">
                {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {comment.mine && (
              <button onClick={() => onDelete(comment.id)}
                className="text-gray-600 hover:text-red-400 transition">
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
        </div>

        {user && (
          <button onClick={() => setShowReply(v => !v)}
            className="text-gray-600 hover:text-blue-400 text-xs mt-1.5 ml-3 transition">
            {showReply ? 'Cancel' : 'Reply'}
          </button>
        )}

        {showReply && (
          <form onSubmit={submitReply} className="flex gap-2 mt-2">
            <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..." autoFocus
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
              Reply
            </button>
          </form>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-2 ml-4 border-l-2 border-gray-800 pl-4">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {reply.userName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold">{reply.userName}</span>
                    {reply.mine && (
                      <button onClick={() => onDelete(reply.id)}
                        className="text-gray-600 hover:text-red-400 transition">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{reply.text}</p>
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
  const [collections, setCollections] = useState([])
  const [savedTo, setSavedTo] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchCollections = async () => {
    try {
      const res = await client.get('/api/collections/me')
      const cols = res.data || []
      setCollections(cols)
      const saved = []
      for (const c of cols) {
        try {
          const detail = await client.get(`/api/collections/${c.id}`)
          const items = detail.data?.items || []
          if (items.some(item => item.resourceId === resourceId)) saved.push(c.id)
        } catch {}
      }
      setSavedTo(saved)
    } catch {}
  }

  const toggle = async () => {
    if (!showMenu) await fetchCollections()
    setShowMenu(v => !v)
    setShowCreate(false)
  }

  const addTo = async (collectionId) => {
    if (savedTo.includes(collectionId)) return
    setLoading(true)
    try {
      await client.post(`/api/collections/${collectionId}/resources/${resourceId}`)
      setSavedTo(prev => [...prev, collectionId])
      setShowMenu(false)
    } catch {} finally { setLoading(false) }
  }

  const createAndAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await client.post('/api/collections', { name: newName.trim(), description: '', isPublic: true })
      await client.post(`/api/collections/${res.data.id}/resources/${resourceId}`)
      setCollections(prev => [res.data, ...prev])
      setSavedTo(prev => [...prev, res.data.id])
      setShowCreate(false)
      setNewName('')
      setShowMenu(false)
    } catch {} finally { setCreating(false) }
  }

  const firstSaved = collections.find(c => savedTo.includes(c.id))

  return (
    <div className="relative">
      <button onClick={toggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
          firstSaved ? 'bg-green-400/10 text-green-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'
        }`}>
        <FolderOpen size={15} />
        {firstSaved ? `In '${firstSaved.name}'` : 'Collect'}
      </button>

      {showMenu && (
        <div className="absolute top-10 left-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 w-56 overflow-hidden">
          {collections.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">No collections yet</div>
          ) : collections.map(c => (
            <button key={c.id} onClick={() => addTo(c.id)}
              disabled={loading || savedTo.includes(c.id)}
              className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between ${
                savedTo.includes(c.id) ? 'text-green-400 bg-green-500/5 cursor-default' : 'text-gray-300 hover:bg-gray-800'
              }`}>
              <span>{c.name}</span>
              {savedTo.includes(c.id) && <Check size={14} />}
            </button>
          ))}
          {!showCreate ? (
            <button onClick={() => setShowCreate(true)}
              className="w-full text-left px-4 py-2.5 text-blue-400 hover:bg-gray-800 text-sm transition border-t border-gray-800 flex items-center gap-2">
              <Plus size={14} /> New Collection
            </button>
          ) : (
            <form onSubmit={createAndAdd} className="p-3 border-t border-gray-800">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Collection name..." autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={creating}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition">
                  {creating ? 'Creating...' : 'Create & Add'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

function AddToReadingListButton({ resourceId }) {
  const [inList, setInList] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { checkIfInList() }, [resourceId])

  const checkIfInList = async () => {
    try {
      const res = await client.get('/api/reading-list')
      const items = res.data.content || []
      setInList(items.some(item => item.resource.id === resourceId))
    } catch {}
  }

  const toggle = async () => {
    setLoading(true)
    try {
      if (inList) {
        await client.delete(`/api/reading-list/${resourceId}`)
        setInList(false)
      } else {
        await client.post(`/api/reading-list/${resourceId}`)
        setInList(true)
      }
    } catch {} finally { setLoading(false) }
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
        inList ? 'bg-green-400/10 text-green-400 hover:bg-red-400/10 hover:text-red-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'
      }`}>
      <BookOpen size={15} />
      {inList ? 'Reading List' : 'Read Later'}
    </button>
  )
}