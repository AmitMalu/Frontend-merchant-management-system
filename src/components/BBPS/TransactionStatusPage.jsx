import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MdSearch } from "react-icons/md";
import { TopBar, ReceiptRow } from "./BBPSPage";
import { findUatTransactionByRefId, findUatTransactionsByMobile } from "./bbpsServices";
import { toast } from "react-toastify";

// UAT ONLY — fixed mock OTP, no real SMS gateway wired up yet. Remove once
// live credentials + a real OTP provider are in place.
const MOCK_OTP = "123456";

const TransactionResultRow = ({ txn }) => (
  <div className="border border-gray-100 rounded-xl px-4 py-2">
    <div className="flex items-center justify-between border-b border-gray-100 py-2">
      <span className="font-semibold text-gray-800">{txn.billerName}</span>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          txn.txnStatus === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {txn.txnStatus}
      </span>
    </div>
    <ReceiptRow label="BBPS Transaction ID" value={txn.txnReferenceId} mono />
    <ReceiptRow label="Agent ID" value={txn.agentId} mono />
    <ReceiptRow label="Biller ID" value={txn.billerId} />
    <ReceiptRow label="Amount" value={`₹${(Number(txn.amount) / 100).toFixed(2)}`} />
    <ReceiptRow label="Transaction Date" value={txn.txnDate} />
    <ReceiptRow label="Mobile Number" value={txn.mobile} />
    <ReceiptRow label="Approval Number" value={txn.approvalRefNumber} />
  </div>
);

const TransactionStatusPage = () => {
  const navigate = useNavigate();

  const [searchMode, setSearchMode] = useState("REF_ID"); // REF_ID | MOBILE
  const [refId, setRefId] = useState("");
  const [mobile, setMobile] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null); // null = no search yet, [] = searched, no results

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setResults(null);
    setOtpSent(false);
    setOtp("");
  };

  const handleRefIdSearch = () => {
    if (!refId.trim()) {
      toast.error("Enter a BBPS Transaction Ref ID");
      return;
    }
    setSearching(true);
    const match = findUatTransactionByRefId(refId);
    setResults(match ? [match] : []);
    setSearching(false);
  };

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(mobile.trim())) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.info(`UAT demo — use OTP ${MOCK_OTP}`);
  };

  const handleVerifyAndSearch = () => {
    if (otp.trim() !== MOCK_OTP) {
      toast.error("Invalid OTP");
      return;
    }
    setSearching(true);
    const matches = findUatTransactionsByMobile(mobile).filter((t) => {
      if (!fromDate && !toDate) return true;
      const txnDay = t.txnDate?.slice(0, 10);
      if (fromDate && txnDay < fromDate) return false;
      if (toDate && txnDay > toDate) return false;
      return true;
    });
    setResults(matches);
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Transaction Status" onBack={() => navigate(-1)} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          {/* Search mode */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search By <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "REF_ID", label: "BBPS Transaction Ref ID" },
                { value: "MOBILE", label: "Mobile Number & Date Range" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    searchMode === opt.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="searchMode"
                    checked={searchMode === opt.value}
                    onChange={() => handleSearchModeChange(opt.value)}
                    className="accent-indigo-700"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Search fields */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {searchMode === "REF_ID" ? (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[260px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    BBPS Transaction Ref ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="e.g. CC015323BAAG00032929"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleRefIdSearch}
                  disabled={searching}
                  className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <MdSearch /> Search
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setOtpSent(false); }}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors"
                  >
                    Send OTP
                  </button>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[160px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleVerifyAndSearch}
                      disabled={searching}
                      className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <MdSearch /> Verify &amp; Search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results */}
          {results !== null && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700">
                {results.length} transaction{results.length !== 1 ? "s" : ""} found
              </h3>
              {results.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-300 rounded-lg">
                  No transaction found.
                </p>
              ) : (
                results.map((txn) => <TransactionResultRow key={txn.txnReferenceId} txn={txn} />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusPage;
