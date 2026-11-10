import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdSearch } from "react-icons/md";
import { TopBar, ReceiptRow } from "./BBPSPage";
import { fetchTransactionStatusLive, fetchMyBbpsTransactions } from "./bbpsServices";
import { toast } from "react-toastify";

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
    <ReceiptRow label="B-Connect Txn ID" value={txn.txnReferenceId} mono />
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

  const [refId, setRefId] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null); // null = no search yet, [] = searched, no results
  const [recent, setRecent] = useState([]);

  // Your own latest payments, so you can pick one instead of typing the ID.
  useEffect(() => {
    fetchMyBbpsTransactions().then(setRecent).catch(() => setRecent([]));
  }, []);

  // The status answer has no friendly biller name (only billerId), so show the biller ID.
  const mapVendorTxnList = (txnList) =>
    (txnList || []).map((t) => ({
      billerName: t.billerId,
      txnStatus: t.txnStatus,
      txnReferenceId: t.txnReferenceId,
      agentId: t.agentId,
      billerId: t.billerId,
      amount: t.amount,
      txnDate: t.txnDate,
      mobile: t.mobile,
      approvalRefNumber: t.approvalRefNumber,
    }));

  // Status of one of your own payments, by its B-Connect Txn ID.
  const handleSearch = async (idToSearch = refId) => {
    const id = (idToSearch || "").trim();
    if (!id) {
      toast.error("Enter a B-Connect Txn ID");
      return;
    }
    setSearching(true);
    try {
      const res = await fetchTransactionStatusLive(id);
      const vendorData = res?.data;
      if (res?.statusCode !== 200 || !vendorData || vendorData.responseCode !== "000") {
        const msg = vendorData?.errorInfo?.error?.[0]?.errorMessage || res?.message || "Transaction not found";
        toast.error(msg);
        setResults([]);
        return;
      }
      setResults(mapVendorTxnList(vendorData.txnList));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="Transaction Status" onBack={() => navigate(-1)} />

      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[260px]">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  B-Connect Txn ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Transaction ID from your receipt"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={searching}
                className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-full hover:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {searching
                  ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  : <MdSearch />}
                Search
              </button>
            </div>
            <p className="text-xs text-gray-500">You can check the status of your own bill payments only.</p>
          </div>

          {/* Your latest payments */}
          {recent.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700">Your recent payments</h3>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {recent.map((t) => (
                  <button
                    key={t.txnRefId}
                    onClick={() => { setRefId(t.txnRefId); handleSearch(t.txnRefId); }}
                    disabled={searching}
                    className="w-full text-left px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-semibold text-gray-800">{t.billerName || t.category || "Bill payment"}</span>
                    <span className="text-gray-500 ml-2 font-mono text-xs">{t.txnRefId}</span>
                    <span className="text-gray-500 ml-2">₹{Number(t.amount).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
