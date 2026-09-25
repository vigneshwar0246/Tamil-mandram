import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { LoadingSkeleton, ErrorState, Button, toast, Modal } from "../../components/ui";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus ? `/admin/submissions?status=${filterStatus}` : "/admin/submissions";
      const data = await api.get(url, true);
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const handleReview = async (status) => {
    if (!selectedSub) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/submissions/${selectedSub.id}/review`, {
        status,
        review_note: reviewNote,
      }, true);
      toast(`Submission marked as ${status}`, "success");
      setSelectedSub(null);
      setReviewNote("");
      loadSubmissions();
    } catch (err) {
      toast(err.message || "Review failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Community Submissions</h1>
          <p className="text-sm opacity-70">Review and moderate user submitted heritage items and stories</p>
        </div>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                filterStatus === st ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "surface hover:bg-black/5"
              }`}
            >
              {st || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSubmissions} />
      ) : submissions.length > 0 ? (
        <div className="surface rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-black/5 text-xs uppercase opacity-70 dark:border-white/10 dark:bg-white/5">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold">{sub.title}</td>
                    <td className="p-4">{sub.name} <br/><span className="text-xs opacity-60">{sub.email}</span></td>
                    <td className="p-4 capitalize">{sub.content_type}</td>
                    <td className="p-4">{sub.location_name || "—"}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        sub.status === "approved" ? "bg-green-600/10 text-green-700 dark:text-green-300" :
                        sub.status === "rejected" ? "bg-red-600/10 text-red-700 dark:text-red-300" :
                        "bg-amber-600/10 text-amber-700 dark:text-amber-300"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedSub(sub); setReviewNote(sub.review_note || ""); }}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface rounded-2xl p-12 text-center text-sm opacity-60">
          No submissions found for the selected filter.
        </div>
      )}

      {/* Review Modal */}
      {selectedSub && (
        <Modal open={Boolean(selectedSub)} onClose={() => setSelectedSub(null)} title="Review Submission" wide>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase opacity-60">Title</p>
              <p className="text-lg font-bold">{selectedSub.title}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase opacity-60">Submitted By</p>
              <p>{selectedSub.name} ({selectedSub.email})</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase opacity-60">Description</p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-black/5 p-4 dark:bg-white/5">{selectedSub.description}</p>
            </div>
            {selectedSub.source_note && (
              <div>
                <p className="text-xs font-semibold uppercase opacity-60">Source Note</p>
                <p>{selectedSub.source_note}</p>
              </div>
            )}
            <div>
              <label className="label">Review / Moderation Note</label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="input"
                placeholder="Optional feedback or rejection reason..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <Button variant="ghost" onClick={() => setSelectedSub(null)}>
                Cancel
              </Button>
              <button
                disabled={submitting}
                onClick={() => handleReview("rejected")}
                className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Reject
              </button>
              <button
                disabled={submitting}
                onClick={() => handleReview("approved")}
                className="rounded-xl bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Approve & Publish
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
