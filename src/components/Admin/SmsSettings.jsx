import React, { useCallback, useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Info } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../constants/API/axiosInstance";

// Admin > Other > SMS Settings. One switch per SMS the system sends to customers.
// Off means that SMS is not sent at all (by any sender) until it is switched on again.
// Data: GET /sms-settings, PUT /sms-settings/{key} { enabled }.

const errorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.response?.data?.error || fallback;

const when = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const Switch = ({ on, busy, onClick, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={busy}
    onClick={onClick}
    className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      on ? "bg-green-500 focus:ring-green-400" : "bg-gray-300 focus:ring-gray-400"
    } ${busy ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
        on ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const ConfirmOff = ({ item, busy, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-900">Switch off this SMS?</h3>
      <p className="mt-2 text-sm text-gray-700">
        <strong>{item.label}</strong>
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Customers will <strong>stop receiving</strong> this SMS right away. Payments and everything else keep working.
        You can switch it on again at any time.
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {busy ? "Switching off..." : "Yes, switch off"}
        </button>
      </div>
    </div>
  </div>
);

const SmsSettings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await api.get("/sms-settings");
      setData(response.data);
    } catch (e) {
      console.error("SMS settings fetch error:", e);
      setLoadError(errorMessage(e, "Could not load the SMS settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (item, enabled) => {
    setSavingKey(item.key);
    try {
      const response = await api.put(`/sms-settings/${item.key}`, { enabled });
      setData((current) => ({
        ...current,
        items: current.items.map((row) => (row.key === item.key ? response.data : row)),
      }));
      toast.success(`${item.label}: SMS switched ${enabled ? "on" : "off"}`);
    } catch (e) {
      toast.error(errorMessage(e, `Could not switch ${item.label}`));
    } finally {
      setSavingKey(null);
      setConfirmItem(null);
    }
  };

  const onToggle = (item) => {
    if (item.enabled) {
      setConfirmItem(item); // switching OFF stops customer SMS, so ask first
    } else {
      save(item, true);
    }
  };

  const items = data?.items || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow">
        <div className="p-2 bg-white/20 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">SMS Settings</h1>
          <p className="text-rose-100 text-sm mt-0.5">
            Switch each SMS that customers receive on or off. A change applies right away.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="rounded-md border border-amber-300 px-3 py-1 hover:bg-amber-100">
            Retry
          </button>
        </div>
      )}

      {data && !data.surepassSwitchedOn && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>
            The new SMS sender (Surepass) is not switched on for the server yet. Messages that were already being sent
            keep going out as before, and the switches below still control them.
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {loading && !data ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : items.length === 0 && !loadError ? (
          <p className="p-6 text-sm text-gray-500">
            No SMS is set up yet. The list appears after the server has started once with the SMS update.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.enabled ? "Customers receive this SMS" : "Switched off: customers do not receive this SMS"}
                  {item.updatedBy ? ` · last changed by ${item.updatedBy}${item.updatedAt ? ` on ${when(item.updatedAt)}` : ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.enabled ? "ON" : "OFF"}
                </span>
                <Switch
                  on={item.enabled}
                  busy={savingKey === item.key}
                  onClick={() => onToggle(item)}
                  label={`${item.label} SMS`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {confirmItem && (
        <ConfirmOff
          item={confirmItem}
          busy={savingKey === confirmItem.key}
          onCancel={() => setConfirmItem(null)}
          onConfirm={() => save(confirmItem, false)}
        />
      )}
    </div>
  );
};

export default SmsSettings;
