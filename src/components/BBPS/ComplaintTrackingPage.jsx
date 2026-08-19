import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MdSearch } from "react-icons/md";
import { TopBar, ReceiptRow } from "./BBPSPage";
import { trackUatComplaint } from "./bbpsServices";
import { toast } from "react-toastify";

const ComplaintTrackingPage = () => {
  const navigate = useNavigate();

  const [complaintId, setComplaintId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckStatus = () => {
    if (!complaintId.trim()) {
      toast.error("Enter a Complaint ID");
      return;
    }
    setChecking(true);
    // UAT ONLY — no live /billpay/extComplaints/track call yet.
    setResult(trackUatComplaint(complaintId));
    setChecking(false);
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
                  placeholder="e.g. CC0125301466289"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <MdSearch /> Check Status
              </button>
            </div>
          </div>

          {result && (
            <div>
              <div className="border border-gray-100 rounded-xl px-4">
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <span className="font-semibold text-gray-800">Complaint Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    {result.complaintStatus}
                  </span>
                </div>
                <ReceiptRow label="Complaint ID" value={result.complaintId} mono />
                <ReceiptRow label="Complaint Assigned To" value={result.complaintAssigned} />
                <ReceiptRow label="Complaint Remarks" value={result.complaintRemarks} />
                <ReceiptRow label="Response Status" value={result.responseReason} />
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
