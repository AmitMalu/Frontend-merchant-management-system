import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  errorMessage,
  getFranchises,
  getMerchants,
  getPayoutAttempts,
  getPayoutEngine,
  savePayoutEngine,
} from "./routingApi";

const MODES = [
  {
    key: "OLD",
    title: "Old flow (today)",
    text: "Every payout works exactly as it always has. This is the safe default.",
  },
  {
    key: "PILOT",
    title: "Pilot",
    text: "Only the accounts you choose below use the new flow. Everyone else keeps the old flow.",
  },
  {
    key: "ON",
    title: "New flow for everyone",
    text: "Every payout uses the new flow. The old flow stays in the system, so you can switch back at any time.",
  },
];

const STATUS_STYLE = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CREATED: "bg-gray-100 text-gray-700",
  FAILED: "bg-red-100 text-red-700",
  UNKNOWN: "bg-purple-100 text-purple-700",
};

const SIZE = 15;

/**
 * Which payout flow is used. The new flow commits the debit first, calls the vendor with no wallet lock, and
 * then applies the answer. Each try on the vendor is recorded as an attempt (shown below).
 */
const PayoutEngineTab = () => {
  const [mode, setMode] = useState("OLD");
  const [savedMode, setSavedMode] = useState("OLD");
  const [useRouting, setUseRouting] = useState(false);
  const [savedUseRouting, setSavedUseRouting] = useState(false);
  const [options, setOptions] = useState([]);
  const [pilot, setPilot] = useState([]);
  const [attempts, setAttempts] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const s = await getPayoutEngine();
      setMode(s.mode);
      setSavedMode(s.mode);
      setUseRouting(!!s.useRouting);
      setSavedUseRouting(!!s.useRouting);
      setPilot(s.pilotAccounts.map((a) => ({ value: `${a.type}:${a.id}`, label: `${a.name} (${a.type === "MERCHANT" ? "Merchant" : "Franchise"})`, type: a.type, id: a.id })));
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the payout engine"));
    }
  }, []);

  const loadAttempts = useCallback(async () => {
    try {
      setAttempts((await getPayoutAttempts(page, SIZE)) || { content: [], totalPages: 0, totalElements: 0 });
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the attempts"));
    }
  }, [page]);

  useEffect(() => {
    loadStatus();
    Promise.all([getMerchants(), getFranchises()])
      .then(([m, f]) =>
        setOptions([
          ...m.filter((x) => x.businessName).map((x) => ({ value: `MERCHANT:${x.id}`, label: `${x.businessName} (Merchant)`, type: "MERCHANT", id: x.id })),
          ...f.filter((x) => x.franchiseName).map((x) => ({ value: `FRANCHISE:${x.id}`, label: `${x.franchiseName} (Franchise)`, type: "FRANCHISE", id: x.id })),
        ].sort((a, b) => a.label.localeCompare(b.label)))
      )
      .catch(() => setOptions([]));
  }, [loadStatus]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const save = async () => {
    if (mode === "PILOT" && pilot.length === 0) return toast.error("Choose at least one pilot account");
    let text =
      mode === "ON"
        ? "Switch EVERY payout to the new flow? You can switch back to the old flow at any time."
        : mode === "PILOT"
        ? `Use the new flow only for ${pilot.length} pilot account(s)?`
        : "Go back to the old flow for every payout?";
    if (useRouting !== savedUseRouting) {
      text += useRouting
        ? "\n\nAlso: payouts of the new flow will follow each account's routing (vendor, limits, retries)."
        : "\n\nAlso: payouts will stop following the routing and use the fixed vendor.";
    }
    if (!window.confirm(text)) return;
    setSaving(true);
    try {
      await savePayoutEngine(mode, pilot.map((p) => ({ type: p.type, id: p.id })), useRouting);
      toast.success("Saved. It takes effect within about 15 seconds.");
      loadStatus();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const changed = mode !== savedMode || mode === "PILOT" || useRouting !== savedUseRouting;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Payout flow</h3>
          <span className="text-xs text-gray-500">
            Now: <strong>{savedMode === "OLD" ? "Old flow" : savedMode === "PILOT" ? "Pilot" : "New flow for everyone"}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {MODES.map((m) => (
            <label
              key={m.key}
              className={`cursor-pointer rounded-lg border p-4 text-sm ${mode === m.key ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input type="radio" className="mr-2" checked={mode === m.key} onChange={() => setMode(m.key)} />
              <span className="font-semibold text-gray-900">{m.title}</span>
              <p className="mt-1 text-xs text-gray-600">{m.text}</p>
            </label>
          ))}
        </div>

        {mode === "PILOT" && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-600">Pilot accounts</label>
            <Select
              isMulti
              options={options}
              value={pilot}
              onChange={(v) => setPilot(v || [])}
              placeholder="Search a merchant or franchise..."
              className="text-sm"
              closeMenuOnSelect={false}
            />
          </div>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 text-sm hover:bg-gray-50">
          <input type="checkbox" className="mt-1" checked={useRouting} onChange={(e) => setUseRouting(e.target.checked)} />
          <span>
            <span className="font-semibold text-gray-900">Use routing for payouts</span>
            <span className="ml-2 text-xs text-gray-500">Now: {savedUseRouting ? "On" : "Off"}</span>
            <p className="mt-1 text-xs text-gray-600">
              When on, a payout of the new flow follows the account's routing: the first vendor that is allowed
              (its min and max amount, its daily payouts and daily amount) is used, and a try that the vendor clearly
              did not take is repeated up to the routing's retry count. If no vendor can serve it, the payout is
              refused before any money moves. Accounts without a routing keep using the fixed vendor. Off (the
              default) changes nothing.
            </p>
          </span>
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} disabled={saving || !changed} className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? "Saving..." : "Save"}
          </button>
          <span className="text-xs text-gray-500">A change takes effect within about 15 seconds. Payouts already in progress finish normally.</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold text-gray-800">Attempts on the vendor (new flow only)</span>
          <button onClick={loadAttempts} className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Attempt</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Vendor answer</th>
            </tr>
          </thead>
          <tbody>
            {attempts.content.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  No attempts yet. They appear when a payout goes through the new flow.
                </td>
              </tr>
            ) : (
              attempts.content.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(a.at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-800">{a.accountName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{a.payoutRef}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">₹{Number(a.amount ?? 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-700">{a.vendor}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[a.status] || "bg-gray-100 text-gray-700"}`}>
                      #{a.attemptNo} {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[a.payoutStatus] || "bg-gray-100 text-gray-700"}`}>
                      {a.payoutStatus}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-gray-600">{a.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
          <span>
            Page {attempts.totalPages === 0 ? 0 : page + 1} of {attempts.totalPages} · {attempts.totalElements} attempt(s)
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
              Previous
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= attempts.totalPages} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutEngineTab;
