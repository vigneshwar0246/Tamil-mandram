import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { LoadingSkeleton, ErrorState, Pagination, Button, toast } from "../../components/ui";

export default function Records() {
  const [data, setData] = useState({ total: 0, pages: 1, items: [] });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (status) params.set("status", status);
      params.set("page", page.toString());
      params.set("page_size", "15");

      const res = await api.get(`/admin/records?${params.toString()}`, true);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [search, status, page]);

  const handleArchiveToggle = async (slug) => {
    try {
      await api.del(`/heritage/${slug}?mode=archive`, true);
      toast("Record archived", "success");
      loadRecords();
    } catch (err) {
      toast(err.message || "Failed to archive", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Heritage Records Directory</h1>
          <p className="text-sm opacity-70">Manage all monuments, literature, art forms, and cultural items</p>
        </div>
      </div>

      <div className="surface rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title or slug..."
          className="input flex-1"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadRecords} />
      ) : data.items?.length > 0 ? (
        <div className="surface rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-black/5 text-xs uppercase opacity-70 dark:border-white/10 dark:bg-white/5">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {data.items.map((item) => (
                  <tr key={item.id || item.slug} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-4 font-semibold">
                      <Link to={`/heritage/${item.slug}`} className="hover:underline text-maroon-700 dark:text-gold-400">
                        {item.title}
                      </Link>
                      {item.title_ta && <p className="font-tamil text-xs opacity-75">{item.title_ta}</p>}
                    </td>
                    <td className="p-4">{item.category?.name || item.category_slug || "—"}</td>
                    <td className="p-4 capitalize">{item.item_type || "—"}</td>
                    <td className="p-4">{item.view_count || 0}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        item.status === "published" ? "bg-green-600/10 text-green-700 dark:text-green-300" :
                        "bg-gray-500/10 text-gray-700 dark:text-gray-300"
                      }`}>
                        {item.status || "published"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleArchiveToggle(item.slug)}>
                        Archive
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-black/5 dark:border-white/5">
            <Pagination page={page} pages={data.pages} onChange={(p) => setPage(p)} />
          </div>
        </div>
      ) : (
        <div className="surface rounded-2xl p-12 text-center text-sm opacity-60">
          No records found.
        </div>
      )}
    </div>
  );
}
