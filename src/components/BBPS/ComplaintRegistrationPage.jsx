import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TopBar, ReceiptRow } from "./BBPSPage";
import { COMPLAINT_DISPOSITIONS, fetchMyBbpsTransactions, registerComplaint } from "./bbpsServices";
import { toast } from "react-toastify";

const ComplaintRegistrationPage = () => {
  const navigate = useNavigate();

  // ── Step 1: the payment the complaint is about (one of your own) ───────
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [txnRefId, setTxnRefId] = useState("");

  // ── Step 2: complaint details ────────────────────────────────────────
  const [disposition, setDisposition] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    fetchMyBbpsTransactions()
      .then(setRecent)
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  const selected = recent.find((t) => t.txnRefId === txnRefId.trim());

  const handleSubmitComplaint = async () => {
    if (!txnRefId.trim()) { toast.error("Enter or pick the transaction"); return; }
    if (!disposition) { toast.error("Select a complaint disposition"); return; }
    if (!description.trim()) { toast.error("Enter a complaint description"); return; }
    if (description.trim().length > 255) { toast.error("Description cannot exceed 255 characters"); return; }

    setSubmitting(true);
    try {
      const result = await registerComplaint({
        txnRefId: txnRefId.trim(),
        disposition,
        description: description.trim(),
      });
      setResponse(result);
      toast.success("Complaint registered successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not register the complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewComplaint = () => {
    setResponse(null);
    setTxnRefId("");
    setDisposition("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Raise Complaint" onBack={() => navigate(-1)} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          {response ? (
            /* ── Response screen ── */
            <div>
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">✓</div>
                <h3 className="text-xl font-bold text-gray-800">Your complaint is registered</h3>
              </div>
              <div className="border border-gray-100 rounded-xl px-4">
                <ReceiptRow label="Complaint Type" value={response.complaintType} />
                <ReceiptRow label="B-Connect Txn ID" value={response.txnRefId} mono />
                <ReceiptRow label="Complaint ID" value={response.complaintId} mono bold />
                <ReceiptRow label="Complaint Assigned To" value={response.complaintAssigned} />
                <ReceiptRow label="Status" value={response.status} />
              </div>
              <p className="text-xs text-gray-500 pt-3">
                Keep the Complaint ID. You can check its status any time from Complaint Status.
              </p>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNewComplaint}
                  className="px-6 py-2.5 border border-indigo-300 text-indigo-600 text-sm font-bold rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Register Another Complaint
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: the transaction */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  B-Connect Txn ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={txnRefId}
                  onChange={(e) => setTxnRefId(e.target.value)}
                  placeholder="Transaction ID from your receipt"
                  className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Your latest payments — pick one */}
                {loadingRecent ? (
                  <p className="text-xs text-gray-400">Loading your recent payments…</p>
                ) : recent.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Or pick one of your recent payments:</p>
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {recent.map((t) => (
                        <button
                          key={t.txnRefId}
                          onClick={() => setTxnRefId(t.txnRefId)}
                          className={`w-full text-left px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                            txnRefId.trim() === t.txnRefId
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-gray-300 bg-white hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-semibold text-gray-800">{t.billerName || t.category || "Bill payment"}</span>
                          <span className="text-gray-500 ml-2 font-mono text-xs">{t.txnRefId}</span>
                          <span className="text-gray-500 ml-2">₹{Number(t.amount).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selected && (
                  <div className="border border-indigo-100 bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-800">
                    Selected: <span className="font-semibold">{selected.billerName || selected.category}</span>{" "}
                    (<span className="font-mono">{selected.txnRefId}</span>) — ₹{Number(selected.amount).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Step 2: complaint details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Complaint Disposition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select disposition</option>
                    {COMPLAINT_DISPOSITIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Complaint Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={255}
                    placeholder="Describe the issue (max 255 characters)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{description.length}/255</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitComplaint}
                    disabled={submitting}
                    className="px-7 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 uppercase tracking-wide flex items-center gap-2"
                  >
                    {submitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    Submit Complaint
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintRegistrationPage;
