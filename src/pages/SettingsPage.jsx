// src/pages/SettingsPage.jsx
// src/pages/SettingsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import client from "../api/client";
import { useAuth } from "../store/authStore";
import ImageUpload from "../components/ImageUpload";
import { usePageTitle } from "../hooks/usePageTitle";

import {
  User,
  Lock,
  Trash2,
  BookOpen,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  ShieldAlert,
} from "lucide-react";
const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "password", label: "Password", icon: Lock },
  { key: "publication", label: "Publication", icon: BookOpen },
  { key: "danger", label: "Danger Zone", icon: Trash2 },
];

function Banner({ msg, onClose }) {
  if (!msg) return null;
  const isSuccess = msg.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={`mb-5 border rounded-xl px-4 py-3 flex items-start gap-3 ${
        isSuccess
          ? "bg-green-500/10 border-green-500/20 text-green-200"
          : "bg-red-500/10 border-red-500/20 text-red-200"
      }`}
      role="status"
    >
      <Icon className={isSuccess ? "text-green-400 mt-0.5" : "text-red-400 mt-0.5"} size={18} />
      <div className="flex-1 min-w-0">
        {msg.title ? (
          <p className="text-sm font-semibold text-white/90">{msg.title}</p>
        ) : null}
        <p className="text-sm text-white/80">{msg.text}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/5 transition"
        aria-label="Dismiss"
      >
        <X size={16} className="text-white/70" />
      </button>
    </div>
  );
}

function Card({ title, icon: Icon, subtitle, right, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            {Icon ? <Icon size={16} className="text-blue-400" /> : null}
            {title}
          </h2>
          {subtitle ? <p className="text-gray-500 text-sm mt-1">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children, right }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="block text-sm text-gray-300">{label}</label>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
      {hint ? <p className="text-gray-500 text-xs">{hint}</p> : null}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 outline-none
      focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/15 transition ${props.className || ""}`}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 outline-none
      focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/15 transition resize-none ${
        props.className || ""
      }`}
    />
  );
}

function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition
      bg-blue-600 hover:bg-blue-700 text-white
      cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

function SoftButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition
      bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white/90 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition
      bg-red-600/20 hover:bg-red-600/30 border border-red-600/20 text-red-300 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  usePageTitle('Settings')
  const { user, loginUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const switchTab = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const activeMeta = useMemo(() => TABS.find((t) => t.key === activeTab), [activeTab]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your profile, security, and publication details in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="md:sticky md:top-20 h-fit">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2">
              <nav className="space-y-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;

                  return (
                    <button
                      key={t.key}
                      onClick={() => switchTab(t.key)}
                      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-left border
                        ${
                          active
                            ? "bg-blue-600/15 text-blue-300 border-blue-600/25"
                            : "bg-transparent text-gray-300 border-transparent hover:bg-gray-800 hover:border-gray-700"
                        }
                        ${t.key === "danger" && !active ? "text-red-300 hover:bg-red-400/10" : ""}`}
                    >
                      <Icon size={16} className={active ? "text-blue-300" : "text-gray-400"} />
                      <span className="flex-1">{t.label}</span>
                      {active ? <span className="text-xs text-white/50">Active</span> : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* small helper */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-gray-300 text-sm font-medium">
                {activeMeta?.label || "Settings"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Changes are saved securely. Some actions can’t be undone.
              </p>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 space-y-6">
            {activeTab === "profile" && <ProfileTab user={user} loginUser={loginUser} />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "publication" && <PublicationTab />}
            {activeTab === "danger" && <DangerTab logoutUser={logoutUser} navigate={navigate} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, loginUser }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
    setUsername(user?.username || "");
    setBio(user?.bio || "");
    setAvatarUrl(user?.avatarUrl || "");
  }, [user?.name, user?.username, user?.bio, user?.avatarUrl]);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await client.put("/api/users/me", { name, username, bio, avatarUrl });
      // Update stored user with all returned fields
      loginUser({ ...user, ...res.data }, localStorage.getItem("token"));
      setMsg({ type: "success", title: "Saved", text: "Your profile has been updated." });
    } catch (err) {
      setMsg({
        type: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Failed to update",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Profile"
      icon={User}
      subtitle="Update how you appear across DevBookmark."
    >
      <Banner msg={msg} onClose={() => setMsg(null)} />
      <form onSubmit={save} className="space-y-5">

        {/* Avatar */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-4">
          <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Profile Picture" />
        </div>

        <Field label="Display Name" hint="Shown on your profile and on every resource you post.">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </Field>

        <Field
          label="Username"
          hint="Your unique handle — lowercase letters, numbers and underscores only."
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm shrink-0">@</span>
            <Input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              placeholder="siddhi_dev"
            />
          </div>
        </Field>

        <Field label="Bio" hint="A short intro shown on your profile page. (max 300 chars)">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="What do you build or learn?"
          />
          <p className="text-gray-600 text-xs text-right">{bio.length}/300</p>
        </Field>

        <Field label="Email" hint="Email cannot be changed right now.">
          <Input type="email" value={user?.email || ""} disabled className="text-gray-500" />
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <PrimaryButton type="submit" loading={loading}>
            Save Changes
          </PrimaryButton>
          <span className="text-xs text-gray-500">Changes apply immediately.</span>
        </div>
      </form>
    </Card>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (newPass !== confirm) {
      setMsg({ type: "error", title: "Mismatch", text: "Passwords do not match." });
      return;
    }
    if (newPass.length < 6) {
      setMsg({ type: "error", title: "Too short", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      await client.put("/api/users/me/password", {
        currentPassword: current,
        newPassword: newPass,
      });
      setMsg({ type: "success", title: "Updated", text: "Your password has been changed." });
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (err) {
      setMsg({
        type: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Change Password"
      icon={Lock}
      subtitle="Use a strong password you don’t reuse elsewhere."
      right={
        <span className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">
          <ShieldAlert size={14} className="text-gray-400" />
          Security
        </span>
      }
    >
      <Banner msg={msg} onClose={() => setMsg(null)} />
      <form onSubmit={save} className="space-y-5">
        <Field label="Current Password">
          <Input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            placeholder="••••••••"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="New Password" hint="Minimum 6 characters.">
            <Input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirm New Password">
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <PrimaryButton type="submit" loading={loading}>
            Update Password
          </PrimaryButton>
          <span className="text-xs text-gray-500">You may need to login again on other devices.</span>
        </div>
      </form>
    </Card>
  );
}

function PublicationTab() {
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);

  // edit mode: false => show summary card only; true => show form
  const [editOpen, setEditOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    fetchPub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPub = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await client.get("/api/publications/me");
      setPub(res.data);
      setName(res.data.name || "");
      setBio(res.data.bio || "");
      setSlug(res.data.slug || "");
      setLogoUrl(res.data.logoUrl || "");
      setEditOpen(false); // close by default => clear UX
    } catch {
      setPub(null);
      setEditOpen(true); // if none exists, open create form
    } finally {
      setLoading(false);
    }
  };

  const autoSlugOnCreate = (val) => {
    setName(val);
    if (!pub) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  };

  const normalizeSlug = (val) =>
    val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);

    try {
      const payload = { name, bio, slug: normalizeSlug(slug), logoUrl };

      if (pub) {
        const res = await client.put("/api/publications", payload);
        setPub(res.data);
        setMsg({ type: "success", title: "Updated", text: "Publication details saved." });
        setEditOpen(false); // ✅ closes after update
      } else {
        const res = await client.post("/api/publications", payload);
        setPub(res.data);
        setMsg({ type: "success", title: "Created", text: "Publication created successfully." });
        setEditOpen(false); // ✅ closes after create
      }
    } catch (err) {
      setMsg({
        type: "error",
        title: "Save failed",
        text: err.response?.data?.message || "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePub = async () => {
    if (!window.confirm("Delete your publication? This cannot be undone.")) return;
    try {
      await client.delete("/api/publications");
      setPub(null);
      setName("");
      setBio("");
      setSlug("");
      setLogoUrl("");
      setEditOpen(true); // go back to create mode
      setMsg({ type: "success", title: "Deleted", text: "Publication deleted." });
    } catch {
      setMsg({ type: "error", title: "Delete failed", text: "Failed to delete publication." });
    }
  };

  const closeForm = () => {
    setMsg(null);
    if (pub) {
      // reset draft back to saved data
      setName(pub.name || "");
      setBio(pub.bio || "");
      setSlug(pub.slug || "");
      setLogoUrl(pub.logoUrl || "");
      setEditOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse space-y-4">
        <div className="h-5 bg-gray-800 rounded w-1/3" />
        <div className="h-10 bg-gray-800 rounded" />
        <div className="h-10 bg-gray-800 rounded" />
        <div className="h-10 bg-gray-800 rounded" />
      </div>
    );
  }

  const viewLink = pub ? (
    <Link
      to={`/p/${pub.slug}`}
      target="_blank"
      className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-xs transition"
    >
      <ExternalLink size={14} /> View Page
    </Link>
  ) : null;

  return (
    <Card
      title="Publication"
      icon={BookOpen}
      subtitle="Create a publication page for your writing and resources."
      right={viewLink}
    >
      {/* ✅ Message stays inside the card, not at the top of the whole page */}
      <Banner msg={msg} onClose={() => setMsg(null)} />

      {/* Summary card (when publication exists) */}
      {pub && !editOpen ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 bg-gray-800/60 border border-gray-700 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-700 shrink-0">
              {pub.logoUrl ? (
                <img
                  src={pub.logoUrl}
                  alt={pub.name}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-blue-600">
                  {pub.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{pub.name}</p>
              <p className="text-gray-500 text-sm truncate">devbookmark.com/p/{pub.slug}</p>
              {pub.bio ? <p className="text-gray-400 text-sm mt-1 line-clamp-2">{pub.bio}</p> : null}
            </div>

            <div className="text-right shrink-0">
              <p className="text-white text-sm font-semibold">{pub.followerCount ?? 0}</p>
              <p className="text-gray-500 text-xs">followers</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton type="button" onClick={() => setEditOpen(true)}>
              <span className="inline-flex items-center gap-2">
                <Pencil size={16} /> Edit Publication
              </span>
            </PrimaryButton>
            <DangerButton type="button" onClick={deletePub}>
              Delete
            </DangerButton>
          </div>
        </div>
      ) : null}

      {/* Form (Create or Edit) */}
      {!pub || editOpen ? (
        <div className="mt-1">
          {/* sticky-ish header row inside form */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-white font-semibold">
                {pub ? "Edit Publication" : "Create Publication"}
              </p>
              <p className="text-gray-500 text-sm">
                Pick a clean name and a unique slug for your page.
              </p>
            </div>

            {pub ? (
              <SoftButton type="button" onClick={closeForm}>
                Cancel
              </SoftButton>
            ) : null}
          </div>

          <form onSubmit={save} className="space-y-5">
            <Field label="Publication Name" hint="Shown as the title on your publication page.">
              <Input
                type="text"
                value={name}
                onChange={(e) => (pub ? setName(e.target.value) : autoSlugOnCreate(e.target.value))}
                required
                placeholder="e.g. Siddhi's Dev Notes"
              />
            </Field>

            <Field
              label="Slug"
              hint="Only lowercase letters, numbers and hyphens."
              right={
                pub ? (
                  <span className="text-xs text-gray-500">Changing slug changes your URL</span>
                ) : null
              }
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm shrink-0">/p/</span>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                  required
                  placeholder="siddhi-dev"
                />
              </div>
            </Field>

            <Field label="Bio" hint="A short intro (optional).">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="What do you write about?"
              />
            </Field>

            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-4">
              <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo / Avatar" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <PrimaryButton type="submit" loading={saving}>
                {pub ? "Save Changes" : "Create Publication"}
              </PrimaryButton>

              {pub ? (
                <SoftButton type="button" onClick={() => setEditOpen(false)}>
                  Done
                </SoftButton>
              ) : null}

              {pub ? (
                <DangerButton type="button" onClick={deletePub} className="ml-auto">
                  Delete Publication
                </DangerButton>
              ) : null}
             </div>
          </form>
        </div>
      ) : null}
    </Card>
  );
}

function DangerTab({ logoutUser, navigate }) {
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setBusy(true);
    try {
      await client.delete("/api/users/me");
      logoutUser();
      navigate("/");
    } catch {
      alert("Failed to delete account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-red-500/20 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-red-500/20 flex items-center justify-between">
        <h2 className="text-red-300 font-semibold flex items-center gap-2">
          <Trash2 size={16} /> Danger Zone
        </h2>
        <span className="text-xs text-red-200/70 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5">
          Irreversible
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-5">
          <ShieldAlert size={18} className="text-red-300 mt-0.5" />
          <div>
            <p className="text-white/90 text-sm font-semibold">Delete your account</p>
            <p className="text-red-100/70 text-sm mt-1">
              This permanently deletes your profile, publications, resources, and all related data.
            </p>
          </div>
        </div>

        <button
          onClick={deleteAccount}
          disabled={busy}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
        >
          {busy ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}