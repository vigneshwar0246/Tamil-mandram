import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { LoadingSkeleton, ErrorState, toast } from "../../components/ui";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/admin/users", true);
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`, {}, true);
      toast(`User role updated to ${newRole}`, "success");
      loadUsers();
    } catch (err) {
      toast(err.message || "Role change failed", "error");
    }
  };

  const handleActiveToggle = async (userId, currentActive) => {
    try {
      await api.put(`/admin/users/${userId}/active?active=${!currentActive}`, {}, true);
      toast(`User ${currentActive ? "deactivated" : "activated"}`, "success");
      loadUsers();
    } catch (err) {
      toast(err.message || "Status toggle failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">User Accounts & Roles</h1>
        <p className="text-sm opacity-70">Manage user permissions and system administrators</p>
      </div>

      {loading ? (
        <LoadingSkeleton lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : users.length > 0 ? (
        <div className="surface rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/5 text-xs uppercase opacity-70 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-4 font-semibold">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="input py-1 text-xs w-28"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.is_active ? "bg-green-600/10 text-green-700 dark:text-green-300" : "bg-red-600/10 text-red-700 dark:text-red-300"
                    }`}>
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleActiveToggle(u.id, u.is_active)}
                      className="text-xs font-semibold text-maroon-700 hover:underline dark:text-gold-400"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="surface rounded-2xl p-12 text-center text-sm opacity-60">
          No user accounts found.
        </div>
      )}
    </div>
  );
}
