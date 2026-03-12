import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import RichTextEditor from "../components/RichTextEditor";
import ImageUpload from "../components/ImageUpload";
import FileUpload from "../components/FileUpload";
import {
  ArrowLeft, Link as LinkIcon, Lock, Globe, Users,
  Tag as TagIcon, FileText, Video, Github, BookOpen,
  Loader2, X, Send
} from "lucide-react";

const TYPES = [
  { key: "ARTICLE", label: "Article", icon: BookOpen },
  { key: "VIDEO", label: "Video", icon: Video },
  { key: "REPO", label: "Repo", icon: Github },
  { key: "DOC", label: "Doc", icon: FileText },
  { key: "WRITTEN_POST", label: "Write Post", icon: FileText },
];

const VIS = [
  { key: "PUBLIC", label: "Public", icon: Globe, hint: "Visible to everyone" },
  { key: "FOLLOWERS", label: "Followers", icon: Users, hint: "Only followers can view" },
  { key: "PRIVATE", label: "Private", icon: Lock, hint: "Only you can view" },
];

// Types that support file upload
const FILE_UPLOAD_TYPES = ["ARTICLE", "DOC"];

function validateUrl(value) {
  if (!value?.trim()) return true;
  try { new URL(value); return true; } catch { return false; }
}

function splitTags(raw) {
  return raw.split(",").map(t => t.trim()).filter(Boolean).slice(0, 15);
}

function isEmptyHtml(html) {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length === 0;
}

export default function CreateResourcePage() {
  const navigate = useNavigate();

  const [type, setType] = useState("ARTICLE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [file, setFile] = useState(null); // { url, name, type, size }
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  const isWrittenPost = type === "WRITTEN_POST";
  const supportsFileUpload = FILE_UPLOAD_TYPES.includes(type);
  const tagsList = useMemo(() => splitTags(tags), [tags]);

  const errors = useMemo(() => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!isWrittenPost && !link.trim() && !file?.url) e.link = "Link or file is required";
    if (!isWrittenPost && link.trim() && !validateUrl(link)) e.link = "Enter a valid URL";
    if (isWrittenPost && isEmptyHtml(content)) e.content = "Content is required";
    if (description.length > 280) e.description = "Keep description under 280 characters";
    return e;
  }, [title, link, content, description, isWrittenPost]);

  const hasErrors = Object.keys(errors).length > 0;

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim() || null,
    type,
    visibility,
    tags: tagsList,
    fileUrl: file?.url || null,
    fileName: file?.name || null,
    fileContentType: file?.type || null,
    ...(isWrittenPost
      ? { content: content.trim(), coverImage: coverImage || null }
      : { link: link.trim() }),
  });

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setTouched({ title: true, description: true, link: true, coverImage: true, content: true, tags: true });
    setError("");
    if (hasErrors) return;
    setLoading(true);
    try {
      const res = await client.post("/api/resources", buildPayload());
      navigate(`/resources/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create resource");
    } finally {
      setLoading(false);
    }
  };

  const HeaderIcon = useMemo(() => TYPES.find(t => t.key === type)?.icon || FileText, [type]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">

        {/* Top bar */}
        <div className="flex items-start gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="mt-1 inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-white text-2xl font-semibold flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 grid place-items-center">
                <HeaderIcon size={16} className="text-blue-400" />
              </span>
              {isWrittenPost ? "Write a Post" : "Add Resource"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Share something useful with the community.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">

            {/* Type */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm text-gray-300 mb-3 font-medium">Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key} type="button" onClick={() => { setType(t.key); setFile(null); }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border ${
                        type === t.key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-800 text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                      }`}>
                      <Icon size={16} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Title + Description */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1 font-medium">Title</label>
                <input
                  type="text" value={title}
                  onBlur={() => setTouched(p => ({ ...p, title: true }))}
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition ${
                    touched.title && errors.title ? 'border-red-500/60' : 'border-gray-700 focus:border-blue-500'
                  }`}
                  placeholder="e.g. Spring Security JWT Guide"
                />
                {touched.title && errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1 font-medium">
                  Description <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onBlur={() => setTouched(p => ({ ...p, description: true }))}
                  onChange={e => setDescription(e.target.value)}
                  rows={3} placeholder="What is it about? Who is it for?"
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition resize-none ${
                    touched.description && errors.description ? 'border-red-500/60' : 'border-gray-700 focus:border-blue-500'
                  }`}
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-500">Keep it short and useful.</p>
                  <p className={`text-xs ${description.length > 280 ? 'text-red-400' : 'text-gray-500'}`}>
                    {description.length}/280
                  </p>
                </div>
              </div>
            </section>

            {/* Link OR Written Post */}
            {!isWrittenPost ? (
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1 font-medium">Link</label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="url" value={link}
                      onBlur={() => setTouched(p => ({ ...p, link: true }))}
                      onChange={e => setLink(e.target.value)}
                      className={`w-full pl-10 bg-gray-800 border rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition ${
                        touched.link && errors.link ? 'border-red-500/60' : 'border-gray-700 focus:border-blue-500'
                      }`}
                      placeholder="https://..."
                    />
                  </div>
                  {touched.link && errors.link && <p className="text-xs text-red-400 mt-1">{errors.link}</p>}
                  <p className="text-xs text-gray-500 mt-2">Optional if you attach a file below.</p>
                </div>

                {/* ✅ File upload for ARTICLE and DOC types */}
                {supportsFileUpload && (
                 <FileUpload value={file} onChange={setFile} />
                )}
              </section>
            ) : (
              <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
                <ImageUpload
                  value={coverImage}
                  onChange={setCoverImage}
                  label="Cover Image (optional)"
                />
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Content</label>
                  <RichTextEditor content={content} onChange={setContent} />
                  {touched.content && errors.content && (
                    <p className="text-xs text-red-400 mt-1">{errors.content}</p>
                  )}
                </div>
              </section>
            )}

            {/* Tags */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm text-gray-300 mb-1 font-medium">Tags</label>
              <div className="relative">
                <TagIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full pl-10 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-blue-500 transition"
                  placeholder="spring, java, jwt (comma separated)"
                />
                {tags && (
                  <button type="button" onClick={() => setTags('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>
              {tagsList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagsList.map(t => (
                    <span key={t} className="px-2 py-1 bg-gray-800 text-blue-400 text-xs rounded-md">#{t}</span>
                  ))}
                </div>
              )}
            </section>

            {/* Visibility */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className="block text-sm text-gray-300 mb-3 font-medium">Visibility</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {VIS.map(v => {
                  const Icon = v.icon;
                  return (
                    <button key={v.key} type="button" onClick={() => setVisibility(v.key)}
                      className={`text-left rounded-lg px-3 py-3 border transition ${
                        visibility === v.key
                          ? 'bg-blue-600/15 border-blue-600/40 text-white'
                          : 'bg-gray-800 border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={visibility === v.key ? 'text-blue-400' : 'text-gray-400'} />
                        <span className="text-sm font-medium">{v.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{v.hint}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Send size={16} /> Create</>}
              </button>
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition">
                Cancel
              </button>
            </div>
          </form>

          {/* Preview sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-20">
              <h3 className="text-white font-medium mb-3">Preview</h3>
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
                {coverImage && isWrittenPost && (
                  <img src={coverImage} alt="cover"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={e => e.target.style.display = 'none'} />
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Title</p>
                  <p className="text-white font-semibold">{title || 'Your title here'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 text-sm">{description || 'Add a short description...'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {tagsList.length > 0
                      ? tagsList.map(t => <span key={t} className="px-2 py-0.5 bg-gray-800 text-blue-400 text-xs rounded">#{t}</span>)
                      : <span className="text-gray-600 text-xs">No tags yet</span>
                    }
                  </div>
                </div>
                {file?.url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Attached File</p>
                    <p className="text-green-400 text-xs">✓ File attached</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-1">
                <p><span className="text-gray-300">Tip:</span> Use 2–5 tags for best discovery.</p>
                <p><span className="text-gray-300">Format:</span> "X Guide" / "X Cheatsheet"</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}