import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Clock,
} from "lucide-react";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

// ─── helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
};

const fmt = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const statusBadge = (s) => {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    SUCCESS: "bg-green-100 text-green-700 border-green-300",
    FAILED:  "bg-red-100  text-red-700  border-red-300",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[s] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}>
      {s}
    </span>
  );
};

// ─── Result Modal ─────────────────────────────────────────────────────────────
const ResultModal = ({ result, onClose }) => {
  if (!result) return null;
  const { data, message } = result;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${data.failedToProcess > 0 ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-green-500 to-emerald-600"}`}>
          <div className="flex items-center gap-2">
            {data.failedToProcess > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <span className="font-semibold">{message}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* summary strip */}
        <div className="grid grid-cols-3 divide-x border-b bg-gray-50 text-center text-sm">
          <div className="py-3">
            <p className="text-gray-500 text-xs">Requested</p>
            <p className="font-bold text-gray-800">{data.totalRequested}</p>
          </div>
          <div className="py-3">
            <p className="text-gray-500 text-xs">Succeeded</p>
            <p className="font-bold text-green-600">{data.processedSuccessfully}</p>
          </div>
          <div className="py-3">
            <p className="text-gray-500 text-xs">Failed</p>
            <p className="font-bold text-red-600">{data.failedToProcess}</p>
          </div>
        </div>

        {/* per-transaction results */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {data.results?.map((r) => (
            <div key={r.transactionId} className={`rounded-lg border p-3 text-sm ${r.processed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-semibold text-gray-800">#{r.transactionId}</span>
                <div className="flex items-center gap-2">
                  {r.walletRefunded && (
                    <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                      Wallet Refunded
                    </span>
                  )}
                  {statusBadge(r.finalStatus)}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                <span>Ref: <span className="font-medium text-gray-800">{r.merchantRefId || "—"}</span></span>
                <span>{r.previousStatus} → <strong>{r.finalStatus}</strong></span>
                {r.processedAt && (
                  <span>{new Date(r.processedAt).toLocaleString("en-IN")}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 italic">{r.message}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UpdateTransaction = () => {
  // ── Merchant selection state ───────────────────────────────────────────────
  const [merchantType, setMerchantType] = useState("direct"); // direct | franchise
  const [franchises, setFranchises] = useState([]);
  const [directMerchants, setDirectMerchants] = useState([]);
  const [franchiseMerchants, setFranchiseMerchants] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [selectedMerchantId, setSelectedMerchantId] = useState("");

  // ── Date filters ───────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState(sevenDaysAgo());
  const [endDate, setEndDate] = useState(today());

  // ── Transactions state ─────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [fetching, setFetching] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ── Selection & update ─────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [updateStatus, setUpdateStatus] = useState("FAILED"); // FAILED | SUCCESS
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState(null);

  // ── Loading states ─────────────────────────────────────────────────────────
  const [loadingFranchises, setLoadingFranchises] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // ── Fetch franchises + direct merchants on mount ───────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingFranchises(true);
      try {
        const [fRes, dRes] = await Promise.all([
          api.get("/franchise"),
          api.get("/merchants/direct-merchant"),
        ]);
        setFranchises(fRes.data);
        setDirectMerchants(dRes.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load merchant data");
      } finally {
        setLoadingFranchises(false);
      }
    };
    load();
  }, []);

  // ── Fetch franchise merchants when franchise selected ──────────────────────
  useEffect(() => {
    if (!selectedFranchiseId || merchantType !== "franchise") return;
    const load = async () => {
      setLoadingMerchants(true);
      try {
        const res = await api.get(`/merchants/franchise/${selectedFranchiseId}`);
        setFranchiseMerchants(res.data);
      } catch (e) {
        console.error(e);
        setFranchiseMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };
    load();
  }, [selectedFranchiseId, merchantType]);

  // ── Reset merchant selection when type changes ─────────────────────────────
  useEffect(() => {
    setSelectedFranchiseId("");
    setSelectedMerchantId("");
    setFranchiseMerchants([]);
    setTransactions([]);
    setSelectedIds(new Set());
    setHasFetched(false);
  }, [merchantType]);

  const merchantList =
    merchantType === "franchise" ? franchiseMerchants : directMerchants;

  // ── Fetch PENDING transactions ─────────────────────────────────────────────
  const fetchTransactions = async (pg = 0) => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setFetching(true);
    setSelectedIds(new Set());

    try {
      const params = {
        startDate: `${startDate}T00:00:00`,
        endDate:   `${endDate}T23:59:59`,
        status:    "PENDING",
        page: pg,
        size,
      };

      // merchantId is optional — only add if selected
      if (selectedMerchantId) {
        params.merchantId = selectedMerchantId;
      }

      const res = await api.get("/update-transaction/merchant-report", { params });

      if (res.data.success) {
        setTransactions(res.data.data.transactions || []);
        setTotalElements(
          res.data.data.totalElements ??
          res.data.data.transactions?.length ??
          0
        );
        setPage(pg);
        setHasFetched(true);
      } else {
        toast.error(res.data.message || "Failed to fetch transactions");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setFetching(false);
    }
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 10) {
          toast.error("You can select a maximum of 10 transactions at a time");
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === Math.min(transactions.length, 10)) {
      setSelectedIds(new Set());
    } else {
      const first10 = transactions.slice(0, 10).map((t) => t.customTxnId);
      if (transactions.length > 10) {
        toast.info("Only the first 10 transactions have been selected (maximum limit)");
      }
      setSelectedIds(new Set(first10));
    }
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one transaction");
      return;
    }
    if (!remarks.trim()) {
      toast.error("Please enter remarks before updating");
      return;
    }

    setUpdating(true);
    try {
      const res = await api.post("/update-transaction/payout/status", {
        transactionIds: Array.from(selectedIds),
        status: updateStatus,
        remarks: remarks.trim(),
      });

      setResult(res.data);
      // Refresh the list to reflect updated statuses
      await fetchTransactions(page);
      setSelectedIds(new Set());
      setRemarks("");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(totalElements / size);
  const allSelected =
    transactions.length > 0 &&
    selectedIds.size === Math.min(transactions.length, 10);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow">
        <div className="p-2 bg-white/20 rounded-lg">
          <RefreshCw className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Update Transaction</h1>
          <p className="text-rose-100 text-sm mt-0.5">
            Fetch pending payout transactions and mark them as Success or Failed
          </p>
        </div>
      </div>

      {/* ── Filters card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="w-5 h-0.5 bg-rose-500 rounded" />
          Select Merchant &amp; Date Range
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Merchant Type — radio buttons matching MTransReportFilters style */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="direct"
                  checked={merchantType === "direct"}
                  onChange={(e) => setMerchantType(e.target.value)}
                  className="mr-2"
                />
                Direct Merchant
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="franchise"
                  checked={merchantType === "franchise"}
                  onChange={(e) => setMerchantType(e.target.value)}
                  className="mr-2"
                />
                Franchise Merchant
              </label>
            </div>
          </div>

          {/* Franchise dropdown (franchise only) */}
          {merchantType === "franchise" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Franchise
              </label>
              <select
                value={selectedFranchiseId}
                onChange={(e) => {
                  setSelectedFranchiseId(e.target.value);
                  setSelectedMerchantId("");
                  setTransactions([]);
                  setHasFetched(false);
                }}
                disabled={loadingFranchises}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Choose Franchise</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.franchiseName} - {f.contactPersonName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Merchant dropdown */}
          {(merchantType === "direct" ||
            (merchantType === "franchise" && selectedFranchiseId)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Merchant
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => {
                  setSelectedMerchantId(e.target.value);
                  setTransactions([]);
                  setHasFetched(false);
                }}
                disabled={loadingMerchants || loadingFranchises}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Choose Merchant</option>
                {merchantList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.businessName} - {m.contactPersonName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fetch button */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => fetchTransactions(0)}
            disabled={fetching}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetching ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Fetching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Fetch Pending Transactions
              </>
            )}
          </button>

          {hasFetched && (
            <span className="text-sm text-gray-500">
              {totalElements} total record{totalElements !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
      </div>

      {/* ── Transactions table ── */}
      {hasFetched && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* toolbar */}
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">
                Pending Transactions
              </span>
              {selectedIds.size > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 border border-rose-200 rounded-full px-2 py-0.5">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            {/* Update controls — visible only when rows are selected */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="FAILED">Mark as FAILED</option>
                  <option value="SUCCESS">Mark as SUCCESS</option>
                </select>

                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Remarks (required)"
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-56"
                />

                <button
                  onClick={handleUpdate}
                  disabled={updating || !remarks.trim()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    updateStatus === "FAILED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Updating...
                    </>
                  ) : updateStatus === "FAILED" ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Mark Failed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Success
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No pending transactions found for the selected criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="rounded accent-rose-600"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Txn ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Merchant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Remarks</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Bal. Before</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Bal. After</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => {
                      const isSelected = selectedIds.has(t.customTxnId);
                      const balDiff = (t.balAfterTran || 0) - (t.balBeforeTran || 0);
                      return (
                        <tr
                          key={t.customTxnId}
                          onClick={() => toggleRow(t.customTxnId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-rose-50 hover:bg-rose-100"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(t.customTxnId)}
                              className="rounded accent-rose-600"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs text-gray-900">{t.customTxnId}</p>
                            <p className="font-mono text-xs text-gray-400 truncate max-w-[140px]" title={t.txnId}>{t.txnId}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                            {t.txnDate ? new Date(t.txnDate).toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-800 max-w-[140px] truncate" title={t.merchantName}>
                            {t.merchantName || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5">
                              {t.service}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate" title={t.remarks}>
                            {t.remarks || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-semibold ${t.actionOnBalance === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                              {fmt(t.txnAmount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-600">
                            {fmt(t.balBeforeTran)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-semibold ${balDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {fmt(t.balAfterTran)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {statusBadge(t.state)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 text-sm text-gray-600">
                  <span>
                    Page {page + 1} of {totalPages} — {totalElements} records
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchTransactions(page - 1)}
                      disabled={page === 0 || fetching}
                      className="px-3 py-1 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchTransactions(page + 1)}
                      disabled={page + 1 >= totalPages || fetching}
                      className="px-3 py-1 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Result modal ── */}
      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
    </div>
  );
};

export default UpdateTransaction;
