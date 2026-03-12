import { useRef, useState, useEffect } from "react";
import { uploadFile, formatFileSize, getFileIcon } from "../utils/uploadImage";
import { useAuth } from "../store/authStore";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function FileUpload({ value, onChange, label = "Attach File" }) {
  const { token } = useAuth();
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // keep UI stable even if parent passes stored object
  useEffect(() => {
    if (!value) setError("");
  }, [value]);

  const handleFile = async (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, DOCX, and TXT files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const result = await uploadFile(file, token); // { url, name, size, type }
      onChange(result); // ✅ store full meta
    } catch (err) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(null); // ✅ clear object
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ✅ show uploaded file
  if (value?.url) {
    return (
      <div>
        {label && (
          <label className="block text-sm text-gray-300 mb-2 font-medium">
            {label}
          </label>
        )}

        <div className="flex items-center gap-3 bg-gray-800 border border-green-500/30 rounded-xl px-4 py-3">
          <span className="text-2xl">{getFileIcon(value.type)}</span>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{value.name}</p>
            <p className="text-gray-400 text-xs">{formatFileSize(value.size)}</p>
          </div>

          <CheckCircle size={16} className="text-green-400 shrink-0" />

          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-500 hover:text-red-400 transition shrink-0"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-300 mb-2 font-medium">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          dragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-blue-400 animate-spin" />
            <p className="text-gray-400 text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-700 grid place-items-center">
              <Upload size={18} className="text-gray-400" />
            </div>

            <div>
              <p className="text-white text-sm font-medium">
                Drop file here or <span className="text-blue-400">browse</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                PDF, DOC, DOCX, TXT — max 10 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}