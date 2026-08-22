import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MdSearch } from "react-icons/md";
import { TopBar, ReceiptRow } from "./BBPSPage";
import {
  findUatTransactionByRefId,
  findUatTransactionsByMobile,
  COMPLAINT_DISPOSITIONS,
  registerUatComplaint,
} from "./bbpsServices";
import { sendComplaintRegisteredSms } from "./smsService";
import { toast } from "react-toastify";

const ComplaintRegistrationPage = () => {
  const navigate = useNavigate();

  // ── Step 1: find the transaction the complaint is against ──────────────
  const [findMode, setFindMode] = useState("REF_ID"); // REF_ID | MOBILE
  const [refId, setRefId] = useState("");
  const [mobile, setMobile] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mobileMatches, setMobileMatches] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // ── Step 2: complaint details ────────────────────────────────────────
  const [complaintType, setComplaintType] = useState("Transaction");
  const [disposition, setDisposition] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);

  const resetTxn = () => {
    setSelectedTxn(null);
    setMobileMatches(null);
    setResponse(null);
  };

  const handleFindByRefId = () => {
    if (!refId.trim()) { toast.error("Enter a BBPS Transaction ID"); return; }
    const match = findUatTransactionByRefId(refId);
    if (!match) { toast.error("No transaction found for that ID"); return; }
    setSelectedTxn(match);
    setMobileMatches(null);
  };

  const handleFindByMobile = () => {
    if (!/^\d{10}$/.test(mobile.trim())) { toast.error("Enter a valid 10-digit mobile number"); return; }
    const matches = findUatTransactionsByMobile(mobile).filter((t) => {
      if (!fromDate && !toDate) return true;
      const txnDay = t.txnDate?.slice(0, 10);
      if (fromDate && txnDay < fromDate) return false;
      if (toDate && txnDay > toDate) return false;
      return true;
    });
    if (matches.length === 0) { toast.error("No transactions found for that mobile number"); return; }
    setMobileMatches(matches);
    setSelectedTxn(null);
  };

  const handleSubmitComplaint = () => {
    if (!selectedTxn) { toast.error("Find and select a transaction first"); return; }
    if (!disposition) { toast.error("Select a complaint disposition"); return; }
    if (!description.trim()) { toast.error("Enter a complaint description"); return; }
    if (description.trim().length > 255) { toast.error("Description cannot exceed 255 characters"); return; }

    setSubmitting(true);
    // UAT ONLY — no live /billpay/extComplaints/register call yet.
    const result = registerUatComplaint();
    setResponse(result);
    setSubmitting(false);
    toast.success("Complaint registered successfully");

    sendComplaintRegisteredSms({
      txnRefId: selectedTxn.txnReferenceId,
      complaintId: result.complaintId,
    });
  };

  const handleNewComplaint = () => {
    resetTxn();
    setComplaintType("Transaction");
    setDisposition("");
    setDescription("");
    setRefId("");
    setMobile("");
    setFromDate("");
    setToDate("");
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
                <ReceiptRow label="Complaint Type" value={complaintType} />
                <ReceiptRow label="Transaction ID" value={selectedTxn?.txnReferenceId} mono />
                <ReceiptRow label="Customer Name" value={selectedTxn?.respCustomerName} />
                <ReceiptRow label="Complaint ID" value={response.complaintId} mono bold />
                <ReceiptRow label="Complaint Assigned To" value={response.complaintAssigned} />
                <ReceiptRow label="Status" value={response.responseReason} />
              </div>
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
              {/* Step 1: find transaction */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Identify Transaction <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "REF_ID", label: "BBPS Transaction ID" },
                    { value: "MOBILE", label: "Mobile Number & Date Range" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                        findMode === opt.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="findMode"
                        checked={findMode === opt.value}
                        onChange={() => { setFindMode(opt.value); resetTxn(); }}
                        className="accent-indigo-700"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {findMode === "REF_ID" ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[260px]">
                      <input
                        type="text"
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                        placeholder="e.g. CC015323BAAG00032929"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleFindByRefId}
                      className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors flex items-center gap-2"
                    >
                      <MdSearch /> Find
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[160px]">
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleFindByMobile}
                      className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors flex items-center gap-2"
                    >
                      <MdSearch /> Find
                    </button>
                  </div>
                )}

                {/* Mobile search results — pick one */}
                {mobileMatches && (
                  <div className="space-y-2">
                    {mobileMatches.map((t) => (
                      <button
                        key={t.txnReferenceId}
                        onClick={() => setSelectedTxn(t)}
                        className={`w-full text-left px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                          selectedTxn?.txnReferenceId === t.txnReferenceId
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-300 bg-white hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-semibold text-gray-800">{t.billerName}</span>
                        <span className="text-gray-500 ml-2 font-mono text-xs">{t.txnReferenceId}</span>
                        <span className="text-gray-500 ml-2">₹{(Number(t.amount) / 100).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected transaction summary */}
                {selectedTxn && (
                  <div className="border border-indigo-100 bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-800">
                    Selected: <span className="font-semibold">{selectedTxn.billerName}</span>{" "}
                    (<span className="font-mono">{selectedTxn.txnReferenceId}</span>) — ₹{(Number(selectedTxn.amount) / 100).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Step 2: complaint details */}
              {selectedTxn && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type of Complaint <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Transaction">Transaction</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
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
                      className="px-7 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 uppercase tracking-wide"
                    >
                      Submit Complaint
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintRegistrationPage;
