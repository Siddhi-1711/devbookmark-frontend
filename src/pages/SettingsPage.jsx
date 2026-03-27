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
      className={`mb-5 rounded-xl border px-4 py-3 ${
        isSuccess
          ? "border-green-500/20 bg-green-500/10 text-green-200"
          : "border-red-500/20 bg-red-500/10 text-red-200"
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={isSuccess ? "mt-0.5 text-green-400" : "mt-0.5 text-red-400"}
          size={18}
        />
        <div className="min-w-0 flex-1">
          {msg.title ? (
            <p className="text-sm font-semibold text-white/90">{msg.title}</p>
          ) : null}
          <p className="break-words text-sm text-white/80">{msg.text}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 transition hover:bg-white/5"
          aria-label="Dismiss"
        >
          <X size={16} className="text-white/70" />
        </button>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, subtitle, right, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
      <div className="flex flex-col gap-3 border-b border-gray-800 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-start md:justify-between md:gap-4 lg:px-6">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 font-semibold text-white">
            {Icon ? <Icon size={16} className="shrink-0 text-blue-400" /> : null}
            <span>{title}</span>
          </h2>
          {subtitle ? (
            <p className="mt-1 break-words text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0 self-start md:self-auto">{right}</div> : null}
      </div>
      <div className="p-4 sm:p-5 lg:p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children, right }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <label className="block text-sm text-gray-300">{label}</label>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
      {hint ? <p className="break-words text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition
      focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/15 ${props.className || ""}`}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition
      focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/15 ${props.className || ""}`}
    />
  );
}

function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700
      disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

function SoftButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-gray-700 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-red-600/20 bg-red-600/20 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-600/30 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  usePageTitle("Settings");
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

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-5 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
            Manage your profile, security, and publication details in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Mobile tabs */}
          <div className="lg:hidden">
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;

                  return (
                    <button
                      key={t.key}
                      onClick={() => switchTab(t.key)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                        active
                          ? "border-blue-600/25 bg-blue-600/15 text-blue-300"
                          : "border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                      } ${
                        t.key === "danger" && !active
                          ? "text-red-300 hover:bg-red-400/10"
                          : ""
                      }`}
                    >
                      <Icon size={16} className={active ? "text-blue-300" : "text-gray-400"} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-sm font-medium text-gray-300">
                {activeMeta?.label || "Settings"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Changes are saved securely. Some actions can’t be undone.
              </p>
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden h-fit lg:block lg:sticky lg:top-20">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-2">
              <nav className="space-y-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.key;

                  return (
                    <button
                      key={t.key}
                      onClick={() => switchTab(t.key)}
                      className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "border-blue-600/25 bg-blue-600/15 text-blue-300"
                          : "border-transparent bg-transparent text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                      } ${t.key === "danger" && !active ? "text-red-300 hover:bg-red-400/10" : ""}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className={active ? "text-blue-300" : "text-gray-400"} />
                        <span className="flex-1">{t.label}</span>
                        {active ? <span className="text-xs text-white/50">Active</span> : null}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-sm font-medium text-gray-300">
                {activeMeta?.label || "Settings"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Changes are saved securely. Some actions can’t be undone.
              </p>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 space-y-6">
            {activeTab === "profile" && <ProfileTab user={user} loginUser={loginUser} />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "publication" && <PublicationTab />}
            {activeTab === "danger" && (
              <DangerTab logoutUser={logoutUser} navigate={navigate} />
            )}
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
        <div className="rounded-2xl border border-gray-700 bg-gray-800/40 p-4">
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
            <span className="shrink-0 text-sm text-gray-500">@</span>
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
          <p className="text-right text-xs text-gray-600">{bio.length}/300</p>
        </Field>

        <Field label="Email" hint="Email cannot be changed right now.">
          <Input type="email" value={user?.email || ""} disabled className="text-gray-500" />
        </Field>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <PrimaryButton type="submit" loading={loading} className="w-full sm:w-auto">
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
      setMsg({
        type: "error",
        title: "Too short",
        text: "Password must be at least 6 characters.",
      });
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
        <span className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-400">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <PrimaryButton type="submit" loading={loading} className="w-full sm:w-auto">
            Update Password
          </PrimaryButton>
          <span className="text-xs text-gray-500">
            You may need to login again on other devices.
          </span>
        </div>
      </form>
    </Card>
  );
}

function PublicationTab() {
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setEditOpen(false);
    } catch {
      setPub(null);
      setEditOpen(true);
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
        setEditOpen(false);
      } else {
        const res = await client.post("/api/publications", payload);
        setPub(res.data);
        setMsg({
          type: "success",
          title: "Created",
          text: "Publication created successfully.",
        });
        setEditOpen(false);
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
      setEditOpen(true);
      setMsg({ type: "success", title: "Deleted", text: "Publication deleted." });
    } catch {
      setMsg({
        type: "error",
        title: "Delete failed",
        text: "Failed to delete publication.",
      });
    }
  };

  const closeForm = () => {
    setMsg(null);
    if (pub) {
      setName(pub.name || "");
      setBio(pub.bio || "");
      setSlug(pub.slug || "");
      setLogoUrl(pub.logoUrl || "");
      setEditOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5 lg:p-6 animate-pulse">
        <div className="h-5 w-1/3 rounded bg-gray-800" />
        <div className="h-10 rounded bg-gray-800" />
        <div className="h-10 rounded bg-gray-800" />
        <div className="h-10 rounded bg-gray-800" />
      </div>
    );
  }

  const viewLink = pub ? (
    <Link
      to={`/p/${pub.slug}`}
      target="_blank"
      className="inline-flex items-center gap-2 text-xs text-blue-300 transition hover:text-blue-200"
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
      <Banner msg={msg} onClose={() => setMsg(null)} />

      {pub && !editOpen ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800/60 p-4 sm:flex-row sm:items-center">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-700">
              {pub.logoUrl ? (
                <img
                  src={pub.logoUrl}
                  alt={pub.name}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-lg font-bold text-white">
                  {pub.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{pub.name}</p>
              <p className="truncate text-sm text-gray-500">devbookmark.com/p/{pub.slug}</p>
              {pub.bio ? (
                <p className="mt-1 line-clamp-2 break-words text-sm text-gray-400">
                  {pub.bio}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-sm font-semibold text-white">{pub.followerCount ?? 0}</p>
              <p className="text-xs text-gray-500">followers</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton type="button" onClick={() => setEditOpen(true)} className="w-full sm:w-auto">
              <span className="inline-flex items-center gap-2">
                <Pencil size={16} /> Edit Publication
              </span>
            </PrimaryButton>
            <DangerButton type="button" onClick={deletePub} className="w-full sm:w-auto">
              Delete
            </DangerButton>
          </div>
        </div>
      ) : null}

      {!pub || editOpen ? (
        <div className="mt-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-white">
                {pub ? "Edit Publication" : "Create Publication"}
              </p>
              <p className="text-sm text-gray-500">
                Pick a clean name and a unique slug for your page.
              </p>
            </div>

            {pub ? (
              <SoftButton type="button" onClick={closeForm} className="w-full sm:w-auto">
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
                  <span className="text-xs text-gray-500">
                    Changing slug changes your URL
                  </span>
                ) : null
              }
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-gray-500">/p/</span>
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

            <div className="rounded-2xl border border-gray-700 bg-gray-800/40 p-4">
              <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo / Avatar" />
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <PrimaryButton type="submit" loading={saving} className="w-full sm:w-auto">
                {pub ? "Save Changes" : "Create Publication"}
              </PrimaryButton>

              {pub ? (
                <SoftButton type="button" onClick={() => setEditOpen(false)} className="w-full sm:w-auto">
                  Done
                </SoftButton>
              ) : null}

              {pub ? (
                <DangerButton
                  type="button"
                  onClick={deletePub}
                  className="w-full sm:ml-auto sm:w-auto"
                >
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
    <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-gray-900">
      <div className="flex flex-col gap-3 border-b border-red-500/20 px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between lg:px-6">
        <h2 className="flex items-center gap-2 font-semibold text-red-300">
          <Trash2 size={16} /> Danger Zone
        </h2>
        <span className="inline-flex w-fit items-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-200/70">
          Irreversible
        </span>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <ShieldAlert size={18} className="mt-0.5 text-red-300" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/90">Delete your account</p>
            <p className="mt-1 break-words text-sm text-red-100/70">
              This permanently deletes your profile, publications, resources, and all related data.
            </p>
          </div>
        </div>

        <button
          onClick={deleteAccount}
          disabled={busy}
          className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {busy ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}