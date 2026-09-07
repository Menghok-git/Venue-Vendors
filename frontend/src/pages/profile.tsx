import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/authApi";

//profile page: any logged-in user can view + edit their own details.
export default function ProfilePage() {
  const { user, loading } = useAuthGuard(); // any role, just must be logged in
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name ?? ""); setPhone(user.phone ?? ""); }
  }, [user]);

  if (loading || !user) return <p className="p-6">Loading...</p>;

  const save = async () => {
    setSaving(true);
    await authApi.updateMe({ name, phone });
    await refreshUser();
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      <div className="bg-gray-50 border rounded p-4 mb-6 text-sm">
        <p><span className="font-medium">Email:</span> {user.email}</p>
        <p><span className="font-medium">Role:</span> {user.role}</p>
        {user.dateJoined && (
          <p><span className="font-medium">Member since:</span>{" "}
            {new Date(user.dateJoined).toLocaleDateString()}</p>
        )}
      </div>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded mb-4">
          Profile updated.
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Full name</label>
        <input className="w-full border rounded px-3 py-2" value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input className="w-full border rounded px-3 py-2" value={phone}
          onChange={(e) => { setPhone(e.target.value); setSaved(false); }} />
      </div>

      <button onClick={save} disabled={saving}
        className="bg-amber-700 text-white px-5 py-2 rounded hover:bg-amber-800 disabled:opacity-60">
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
