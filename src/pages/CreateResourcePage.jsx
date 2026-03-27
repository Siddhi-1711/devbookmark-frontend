import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import RichTextEditor from "../components/RichTextEditor";
import ImageUpload from "../components/ImageUpload";
import FileUpload from "../components/FileUpload";
import {
  ArrowLeft,
  Link as LinkIcon,
  Lock,
  Globe,
  Users,
  Tag as TagIcon,
  FileText,
  Video,
  Github,
  BookOpen,
  Loader2,
  X,
  Send,
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

const FILE_UPLOAD_TYPES = ["ARTICLE", "DOC"];

function validateUrl(value) {
  if (!value?.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function splitTags(raw) {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 15);
}

function isEmptyHtml(html) {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
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
  }, [title, link, content, description, isWrittenPost, file]);

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
    setTouched({
      title: true,
      description: true,
      link: true,
      coverImage: true,
      content: true,
      tags: true,
    });
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

  const HeaderIcon = useMemo(
    () => TYPES.find((t) => t.key === type)?.icon || FileText,
    [type]
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-5 lg:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex w-fit items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-800 bg-gray-900 sm:h-11 sm:w-11">
              <HeaderIcon size={18} className="text-blue-400" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                {isWrittenPost ? "Write a Post" : "Add Resource"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                Share something useful with the community.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-4 xl:col-span-2">
            {/* Type */}
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setType(t.key);
                        setFile(null);
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        type === t.key
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-800 bg-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Title + Description */}
            <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-lg border bg-gray-800 px-4 py-2.5 text-white outline-none transition placeholder:text-gray-500 ${
                    touched.title && errors.title
                      ? "border-red-500/60"
                      : "border-gray-700 focus:border-blue-500"
                  }`}
                  placeholder="e.g. Spring Security JWT Guide"
                />
                {touched.title && errors.title && (
                  <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Description <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is it about? Who is it for?"
                  className={`w-full resize-none rounded-lg border bg-gray-800 px-4 py-2.5 text-white outline-none transition placeholder:text-gray-500 ${
                    touched.description && errors.description
                      ? "border-red-500/60"
                      : "border-gray-700 focus:border-blue-500"
                  }`}
                />
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">Keep it short and useful.</p>
                  <p
                    className={`shrink-0 text-xs ${
                      description.length > 280 ? "text-red-400" : "text-gray-500"
                    }`}
                  >
                    {description.length}/280
                  </p>
                </div>
              </div>
            </section>

            {/* Link OR Written Post */}
            {!isWrittenPost ? (
              <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Link
                  </label>
                  <div className="relative">
                    <LinkIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="url"
                      value={link}
                      onBlur={() => setTouched((p) => ({ ...p, link: true }))}
                      onChange={(e) => setLink(e.target.value)}
                      className={`w-full rounded-lg border bg-gray-800 px-4 py-2.5 pl-10 text-white outline-none transition placeholder:text-gray-500 ${
                        touched.link && errors.link
                          ? "border-red-500/60"
                          : "border-gray-700 focus:border-blue-500"
                      }`}
                      placeholder="https://..."
                    />
                  </div>
                  {touched.link && errors.link && (
                    <p className="mt-1 text-xs text-red-400">{errors.link}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Optional if you attach a file below.
                  </p>
                </div>

                {supportsFileUpload && <FileUpload value={file} onChange={setFile} />}
              </section>
            ) : (
              <section className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
                <ImageUpload
                  value={coverImage}
                  onChange={setCoverImage}
                  label="Cover Image (optional)"
                />

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Content
                  </label>
                  <div className="min-w-0 overflow-hidden">
                    <RichTextEditor content={content} onChange={setContent} />
                  </div>
                  {touched.content && errors.content && (
                    <p className="mt-1 text-xs text-red-400">{errors.content}</p>
                  )}
                </div>
              </section>
            )}

            {/* Tags */}
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Tags
              </label>

              <div className="relative">
                <TagIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 pl-10 pr-10 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  placeholder="spring, java, jwt (comma separated)"
                />
                {tags && (
                  <button
                    type="button"
                    onClick={() => setTags("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {tagsList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagsList.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-gray-800 px-2 py-1 text-xs text-blue-400 break-all"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Visibility */}
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Visibility
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {VIS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setVisibility(v.key)}
                      className={`rounded-lg border px-3 py-3 text-left transition ${
                        visibility === v.key
                          ? "border-blue-600/40 bg-blue-600/15 text-white"
                          : "border-gray-800 bg-gray-800 text-gray-300 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          size={16}
                          className={visibility === v.key ? "text-blue-400" : "text-gray-400"}
                        />
                        <span className="text-sm font-medium">{v.label}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">{v.hint}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Create
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full rounded-lg bg-gray-800 px-6 py-2.5 font-medium text-white transition hover:bg-gray-700 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Preview sidebar */}
          <aside className="min-w-0 xl:col-span-1">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5 xl:sticky xl:top-20">
              <h3 className="mb-3 text-base font-medium text-white">Preview</h3>

              <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-950 p-4">
                {coverImage && isWrittenPost && (
                  <img
                    src={coverImage}
                    alt="cover"
                    className="h-32 w-full rounded-lg object-cover sm:h-36"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}

                <div>
                  <p className="mb-1 text-xs text-gray-500">Title</p>
                  <p className="break-words font-semibold text-white">
                    {title || "Your title here"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-500">Description</p>
                  <p className="break-words text-sm text-gray-300">
                    {description || "Add a short description..."}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {tagsList.length > 0 ? (
                      tagsList.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-gray-800 px-2 py-0.5 text-xs text-blue-400 break-all"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-600">No tags yet</span>
                    )}
                  </div>
                </div>

                {file?.url && (
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Attached File</p>
                    <p className="text-xs text-green-400">✓ File attached</p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1 border-t border-gray-800 pt-4 text-xs text-gray-500">
                <p>
                  <span className="text-gray-300">Tip:</span> Use 2–5 tags for best discovery.
                </p>
                <p>
                  <span className="text-gray-300">Format:</span> "X Guide" / "X Cheatsheet"
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}