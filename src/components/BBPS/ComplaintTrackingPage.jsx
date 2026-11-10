import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdSearch } from "react-icons/md";
import { TopBar, ReceiptRow } from "./BBPSPage";
import { trackComplaint, fetchMyComplaints } from "./bbpsServices";
import { toast } from "react-toastify";

const ComplaintTrackingPage = () => {
  const navigate = useNavigate();

  const [complaintId, setComplaintId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [mine, setMine] = useState([]);

  // Your own complaints, so you can pick one instead of typing the ID.
  useEffect(() => {
    fetchMyComplaints().then(setMine).catch(() => setMine([]));
  }, []);

  const handleCheckStatus = async (idToCheck = complaintId) => {
    const id = (idToCheck || "").trim();
    if (!id) {
      toast.error("Enter a Complaint ID");
      return;
    }
    setChecking(true);
    try {
      const data = await trackComplaint(id);
      setResult(data);
      // keep the list in step with the status just received
      setMine((list) => list.map((c) => (c.complaintId === data.complaintId ? { ...c, status: data.status } : c)));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not get the complaint status");
    } finally {
      setChecking(false);
    }
  };

  const handleNewSearch = () => {
    setResult(null);
    setComplaintId("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Complaint Status" onBack={() => navigate(-1)} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Complaint ID <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[260px]">
                <input
                  type="text"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCheckStatus(); }}
                  placeholder="Complaint ID you received"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => handleCheckStatus()}
                disabled={checking}
                className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {checking
                  ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  : <MdSearch />}
                Check Status
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">You can check the status of your own complaints only.</p>
          </div>

          {/* Your complaints */}
          {!result && mine.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700">Your complaints</h3>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {mine.map((c) => (
                  <button
                    key={c.complaintId}
                    onClick={() => { setComplaintId(c.complaintId); handleCheckStatus(c.complaintId); }}
                    disabled={checking}
                    className="w-full text-left px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-mono text-xs text-gray-800">{c.complaintId}</span>
                    <span className="text-gray-500 ml-2 font-mono text-xs">{c.txnRefId}</span>
                    <span className="text-gray-500 ml-2">{c.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div>
              <div className="border border-gray-100 rounded-xl px-4">
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <span className="font-semibold text-gray-800">Complaint Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    {result.status}
                  </span>
                </div>
                <ReceiptRow label="Complaint ID" value={result.complaintId} mono />
                <ReceiptRow label="B-Connect Txn ID" value={result.txnRefId} mono />
                <ReceiptRow label="Complaint Assigned To" value={result.complaintAssigned} />
                <ReceiptRow label="Complaint Remarks" value={result.remarks} />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNewSearch}
                  className="px-6 py-2.5 border border-indigo-300 text-indigo-600 text-sm font-bold rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Check Another Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintTrackingPage;
