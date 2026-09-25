import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { LoadingSkeleton, ErrorState } from "../../components/ui";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await api.get("/admin/overview", true);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load admin overview.");
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) return <LoadingSkeleton lines={6} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-70">Tamil-Heritage platform overview and moderation metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        <div className="surface rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold opacity-70">Heritage Records</p>
          <p className="mt-2 font-display text-3xl font-bold text-maroon-700 dark:text-gold-400">{data.heritage_records}</p>
        </div>
        <div className="surface rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold opacity-70">Pending Submissions</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-600">{data.pending_submissions}</p>
        </div>
        <div className="surface rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold opacity-70">Published Stories</p>
          <p className="mt-2 font-display text-3xl font-bold text-maroon-700 dark:text-gold-400">{data.published_stories}</p>
        </div>
        <div className="surface rounded-2xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold opacity-70">Registered Users</p>
          <p className="mt-2 font-display text-3xl font-bold text-maroon-700 dark:text-gold-400">{data.users}</p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="surface rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-display text-xl font-bold">Records by Category</h2>
          <div className="space-y-3">
            {data.by_category?.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{cat.name}</span>
                  <span>{cat.count} items</span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-maroon-700 dark:bg-gold-500"
                    style={{ width: `${Math.min(100, (cat.count / Math.max(1, data.heritage_records)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="surface rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recent Submissions</h2>
            <Link to="/admin/submissions" className="text-xs font-semibold text-maroon-700 hover:underline dark:text-gold-400">
              View All →
            </Link>
          </div>
          {data.recent_submissions?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_submissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-xl border border-black/5 p-3 text-sm dark:border-white/5">
                  <div>
                    <p className="font-semibold">{sub.title}</p>
                    <p className="text-xs opacity-70">By {sub.name} ({sub.email})</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    sub.status === "approved" ? "bg-green-600/10 text-green-700 dark:text-green-300" :
                    sub.status === "rejected" ? "bg-red-600/10 text-red-700 dark:text-red-300" :
                    "bg-amber-600/10 text-amber-700 dark:text-amber-300"
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-60">No recent submissions to review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
