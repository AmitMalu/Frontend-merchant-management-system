import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  clearTrial,
  errorMessage,
  getTrialRows,
  getTrialStatus,
  getTrialSummary,
  setTrialEnabled,
} from "./routingApi";

const SOURCE_LABEL = {
  PAYOUT: "Payout",
  BILL_AVENUE: "Bill Payment via Bill Avenue",
  SUIVREPAY: "Credit Card via SuivrePay",
};

const SIZE = 15;

/**
 * Trial run: on real payments the system also works out which vendor routing WOULD choose, and records it next
 * to the vendor really used. Payments are not changed. Rows are kept only for a few hours.
 */
const TrialTab = () => {
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState([]);
  const [rows, setRows] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [onlyDifferent, setOnlyDifferent] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, sum, r] = await Promise.all([
        getTrialStatus(),
        getTrialSummary(),
        getTrialRows(onlyDifferent, page, SIZE),
      ]);
      setStatus(s);
      setSummary(sum);
      setRows(r || { content: [], totalPages: 0, totalElements: 0 });
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the trial run"));
    } finally {
      setLoading(false);
    }
  }, [onlyDifferent, page]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [autoRefresh, load]);

  const totals = useMemo(() => {
    const t = { all: 0, same: 0, different: 0, noRouting: 0 };
    summary.forEach((r) => {
      t.all += r.count;
      if (r.matched) t.same += r.count;
      else if (r.noRouting) t.noRouting += r.count;
      else t.different += r.count;
    });
    return t;
  }, [summary]);

  const toggle = async () => {
    const next = !status?.enabled;
    const ok = window.confirm(
      next
        ? `Switch the trial run ON? Real payments will also be checked against routing and recorded for ${status?.retentionHours} hours. No payment is changed.`
        : "Switch the trial run OFF? Recording stops. Rows already recorded stay until they expire."
    );
    if (!ok) return;
    try {
      setStatus(await setTrialEnabled(next));
      toast.success(next ? "Trial run switched on" : "Trial run switched off");
    } catch (err) {
      toast.error(errorMessage(err, "Could not change the switch"));
    }
  };

  const clear = async () => {
    if (!window.confirm("Delete all trial rows now?")) return;
    try {
      await clearTrial();
      toast.success("Trial rows cleared");
      setPage(0);
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not clear"));
    }
  };

  const tag = (r) =>
    r.matched ? (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Same</span>
    ) : r.noRouting ? (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">No routing</span>
    ) : (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Different</span>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-sm text-gray-700">
          <span className="mr-2 font-semibold text-gray-900">Trial run is</span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status?.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
            {status?.enabled ? "ON" : "OFF"}
          </span>
          <span className="ml-3 text-xs text-gray-500">
            Rows are kept for {status?.retentionHours ?? 3} hours · {status?.rows ?? 0} row(s) now
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Refresh every 20 seconds
          </label>
          <button onClick={load} className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={clear} className="flex items-center gap-1 rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
            <Trash2 size={14} /> Clear rows
          </button>
          <button
            onClick={toggle}
            className={`rounded px-4 py-1.5 text-xs font-medium text-white ${status?.enabled ? "bg-gray-700 hover:bg-gray-800" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {status?.enabled ? "Switch off" : "Switch on"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card title="Payments checked" value={totals.all} />
        <Card title="Same vendor" value={totals.same} color="text-green-600" />
        <Card title="Different vendor" value={totals.different} color="text-red-600" />
        <Card title="No routing" value={totals.noRouting} color="text-amber-600" />
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="border-b px-4 py-3 text-sm font-semibold text-gray-800">What routing would do, grouped</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Payment path</th>
              <th className="px-4 py-3">Vendor used today</th>
              <th className="px-4 py-3">Routing would choose</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3 text-right">Payments</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {status?.enabled ? "No payments recorded yet." : "The trial run is off. Switch it on to start recording."}
                </td>
              </tr>
            ) : (
              summary.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3 text-gray-800">{SOURCE_LABEL[r.source] || r.source}</td>
                  <td className="px-4 py-3 text-gray-700">{r.usedVendor || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{r.chosenVendor || "-"}</td>
                  <td className="px-4 py-3">{tag(r)}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.count}</td>
                  <td className="px-4 py-3 text-right text-gray-700">₹{Number(r.amount).toLocaleString("en-IN")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold text-gray-800">Recent payments</span>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={onlyDifferent}
              onChange={(e) => {
                setOnlyDifferent(e.target.checked);
                setPage(0);
              }}
            />
            Only differences
          </label>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Routing</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Why</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : rows.content.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Nothing to show.</td>
              </tr>
            ) : (
              rows.content.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(r.at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-800">{r.accountName}</td>
                  <td className="px-4 py-3 text-gray-700">{SOURCE_LABEL[r.source] || r.source}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">₹{Number(r.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-700">{r.usedVendor || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{r.chosenVendor || "-"}</td>
                  <td className="px-4 py-3">{tag(r)}</td>
                  <td className="max-w-xs px-4 py-3 text-xs text-gray-600">{r.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
          <span>
            Page {rows.totalPages === 0 ? 0 : page + 1} of {rows.totalPages} · {rows.totalElements} row(s)
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
              Previous
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= rows.totalPages} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color = "text-blue-600" }) => (
  <div className="rounded-lg bg-white p-4 shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default TrialTab;
