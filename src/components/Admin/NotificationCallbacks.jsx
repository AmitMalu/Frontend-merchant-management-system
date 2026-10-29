import React, { useEffect, useMemo, useState } from "react";
import { BellRing, Pencil, Trash2, AlertTriangle, Plus, Info } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../constants/API/axiosInstance";

// ─── constants ───────────────────────────────────────────────────────────────
const TYPES = [
  { value: "FRANCHISE", label: "Franchise" },
  { value: "FRANCHISE_MERCHANT", label: "Franchise Merchant" },
  { value: "DIRECT_MERCHANT", label: "Direct Merchant" },
];

const TYPE_LABEL = {
  FRANCHISE: "Franchise",
  FRANCHISE_MERCHANT: "Franchise Merchant",
  DIRECT_MERCHANT: "Direct Merchant",
  UNKNOWN: "Not linked",
};

const TYPE_BADGE = {
  FRANCHISE: "bg-purple-100 text-purple-700 border-purple-300",
  FRANCHISE_MERCHANT: "bg-amber-100 text-amber-700 border-amber-300",
  DIRECT_MERCHANT: "bg-blue-100 text-blue-700 border-blue-300",
  UNKNOWN: "bg-gray-100 text-gray-600 border-gray-300",
};

// What the URL is used for, shown under the form
const TYPE_HELP = {
  FRANCHISE:
    "Used for payments on the franchise's own devices, and on its merchants' devices that have no URL of their own.",
  FRANCHISE_MERCHANT:
    "Used only for payments on the selected merchants' devices. You can select several merchants and save once. If a merchant's URL is removed later, the franchise's URL is used for it again.",
  DIRECT_MERCHANT: "Used for payments on the selected merchants' devices. You can select several merchants and save once.",
};

const URL_HINT = "Must start with http:// or https:// (https is recommended). Up to 255 characters.";

const MAX_MERCHANTS = 200; // same limit as the server

const looksLikeUrl = (value) => /^https?:\/\/\S+$/i.test(value.trim()) && value.trim().length <= 255;

const errorMessage = (e, fallback) => e?.response?.data?.message || fallback;

const formatDate = (v) => (v ? new Date(v).toLocaleString("en-IN") : "—");

const merchantLabel = (m) => `${m.businessName}${m.contactPersonName ? ` - ${m.contactPersonName}` : ""}`;

const Spinner = ({ className = "h-4 w-4" }) => (
  <div className={`animate-spin border-2 border-white border-t-transparent rounded-full ${className}`} />
);

const UrlBox = ({ label, url }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-mono text-xs break-all bg-gray-50 border rounded p-2">{url}</p>
  </div>
);

// A line in a confirmation popup: "warn" for something that changes or stops, "info" otherwise
const Note = ({ tone = "info", children }) => (
  <div
    className={`flex items-start gap-2 text-sm rounded-lg p-3 border ${
      tone === "warn" ? "text-amber-800 bg-amber-50 border-amber-200" : "text-blue-800 bg-blue-50 border-blue-200"
    }`}
  >
    {tone === "warn" ? <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> : <Info className="h-4 w-4 mt-0.5 shrink-0" />}
    <span>{children}</span>
  </div>
);

const ModalShell = ({ title, children, onClose, busy, confirmLabel, busyLabel, onConfirm, confirmDisabled, danger }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-3 space-y-3 overflow-y-auto">{children}</div>
      <div className="px-6 py-4 border-t flex justify-end gap-2">
        <button onClick={onClose} disabled={busy} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy || confirmDisabled}
          className={`flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {busy && <Spinner />}
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Merchant multi-select ───────────────────────────────────────────────────
const MerchantMultiSelect = ({ options, selected, onChange, disabledIds, loading, emptyText }) => {
  const [q, setQ] = useState("");

  const filtered = options.filter((m) => merchantLabel(m).toLowerCase().includes(q.trim().toLowerCase()));
  const selectable = filtered.filter((m) => !disabledIds.has(String(m.id)));
  const allSelected = selectable.length > 0 && selectable.every((m) => selected.includes(String(m.id)));

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else if (selected.length >= MAX_MERCHANTS) {
      toast.error(`You can select at most ${MAX_MERCHANTS} merchants at a time`);
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    const merged = [...new Set([...selected, ...selectable.map((m) => String(m.id))])];
    if (merged.length > MAX_MERCHANTS) toast.info(`Only the first ${MAX_MERCHANTS} merchants were selected (maximum)`);
    onChange(merged.slice(0, MAX_MERCHANTS));
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border-b">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search merchants"
          className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={allSelected ? () => onChange(selected.filter((id) => !selectable.some((m) => String(m.id) === id))) : selectAll}
          disabled={selectable.length === 0}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
        >
          {allSelected ? "Unselect shown" : "Select all shown"}
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={selected.length === 0}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
        >
          Clear
        </button>
        <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-1">
          {selected.length} selected
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Loading merchants...</p>
        ) : options.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">{emptyText}</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No merchants match your search</p>
        ) : (
          filtered.map((m) => {
            const id = String(m.id);
            const taken = disabledIds.has(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-3 px-3 py-2 text-sm ${taken ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  disabled={taken}
                  onChange={() => toggle(id)}
                  className="rounded accent-rose-600"
                />
                <span className="flex-1">{merchantLabel(m)}</span>
                {taken && <span className="text-xs">URL already set</span>}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Confirm before adding ───────────────────────────────────────────────────
const ConfirmSaveModal = ({ summary, url, onCancel, onConfirm, saving }) => (
  <ModalShell
    title={summary.heading}
    onClose={onCancel}
    busy={saving}
    confirmLabel="Yes, save"
    busyLabel="Saving..."
    onConfirm={onConfirm}
  >
    <UrlBox label="Notification URL" url={url} />

    {summary.names.length > 0 && (
      <div>
        <p className="text-xs text-gray-500 mb-1">{summary.names.length === 1 ? "Merchant" : `${summary.names.length} merchants`}</p>
        <ul className="max-h-40 overflow-y-auto border rounded p-2 text-sm text-gray-800 list-disc list-inside space-y-0.5">
          {summary.names.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    )}

    {summary.notes.map((n, i) => (
      <Note key={i} tone={n.tone}>
        {n.text}
      </Note>
    ))}

    <p className="text-sm font-medium text-gray-700 pt-1">Are you sure you want to save?</p>
  </ModalShell>
);

// ─── Edit modal (the popup is the confirmation) ──────────────────────────────
const EditModal = ({ row, onClose, onSaved }) => {
  const [url, setUrl] = useState(row.callback || "");
  const [saving, setSaving] = useState(false);

  const unchanged = url.trim() === (row.callback || "").trim();

  const effect = {
    FRANCHISE:
      "From now on, payments on this franchise's own devices, and on its merchants' devices that have no URL of their own, are sent to the new URL instead of the old one. Merchants with their own URL are not affected.",
    FRANCHISE_MERCHANT:
      "From now on, payments on this merchant's devices are sent to the new URL instead of the old one. The franchise's URL is still not used for this merchant.",
    DIRECT_MERCHANT: "From now on, payments on this merchant's devices are sent to the new URL instead of the old one.",
  }[row.type];

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/notification-callbacks/${row.id}`, { callback: url.trim() });
      toast.success("Notification URL updated");
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, "Could not update the Notification URL"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Edit Notification URL"
      onClose={onClose}
      busy={saving}
      confirmLabel="Yes, update"
      busyLabel="Saving..."
      onConfirm={save}
      confirmDisabled={!looksLikeUrl(url) || unchanged}
    >
      <div className="text-sm text-gray-600">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mr-2 ${TYPE_BADGE[row.type] || TYPE_BADGE.UNKNOWN}`}>
          {TYPE_LABEL[row.type] || row.type}
        </span>
        <strong>{row.merchantName || row.franchiseName || "—"}</strong>
        {row.type === "FRANCHISE_MERCHANT" && row.franchiseName ? ` (${row.franchiseName})` : ""}
      </div>

      <UrlBox label="Current URL" url={row.callback} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New URL</label>
        <input
          type="url"
          value={url}
          maxLength={255}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
        <p className={`text-xs mt-1 ${url && !looksLikeUrl(url) ? "text-red-500" : "text-gray-500"}`}>
          {unchanged ? "This is the same as the current URL." : URL_HINT}
        </p>
      </div>

      {effect && !unchanged && looksLikeUrl(url) && <Note tone="warn">{effect}</Note>}
    </ModalShell>
  );
};

// ─── Delete confirmation ─────────────────────────────────────────────────────
const DeleteModal = ({ row, franchiseUrl, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const effect = {
    FRANCHISE:
      "Payments on this franchise's devices (and on its merchants' devices that have no URL of their own) will no longer be sent anywhere.",
    FRANCHISE_MERCHANT: franchiseUrl
      ? `Payments on this merchant's devices will go to the franchise's URL instead: ${franchiseUrl}`
      : "Payments on this merchant's devices will no longer be sent anywhere (the franchise has no URL either).",
    DIRECT_MERCHANT: "Payments on this merchant's devices will no longer be sent anywhere.",
    UNKNOWN: "This record is not used by any payment, so nothing changes.",
  }[row.type];

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/notification-callbacks/${row.id}`);
      toast.success("Notification URL deleted");
      onDeleted();
    } catch (e) {
      toast.error(errorMessage(e, "Could not delete the Notification URL"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalShell
      title="Delete Notification URL?"
      onClose={onClose}
      busy={deleting}
      confirmLabel="Yes, delete"
      busyLabel="Deleting..."
      onConfirm={remove}
      danger
    >
      <p className="text-sm text-gray-700">
        <strong>{row.merchantName || row.franchiseName || "This record"}</strong>
        <span className="text-gray-500"> ({TYPE_LABEL[row.type] || row.type})</span>
      </p>
      <UrlBox label="URL that will be deleted" url={row.callback} />
      <Note tone="warn">{effect}</Note>
    </ModalShell>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const NotificationCallbacks = () => {
  // ── form ───────────────────────────────────────────────────────────────────
  const [type, setType] = useState("FRANCHISE");
  const [franchises, setFranchises] = useState([]);
  const [directMerchants, setDirectMerchants] = useState([]);
  const [franchiseMerchants, setFranchiseMerchants] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [selectedMerchantIds, setSelectedMerchantIds] = useState([]);
  const [url, setUrl] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // ── list ───────────────────────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [listError, setListError] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadRows = async () => {
    setLoadingRows(true);
    setListError("");
    try {
      const res = await api.get("/notification-callbacks");
      setRows(res.data?.data || []);
    } catch (e) {
      setRows([]);
      setListError(errorMessage(e, "Could not load the Notification URLs"));
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    loadRows();
    const loadStatic = async () => {
      try {
        const [fRes, dRes] = await Promise.all([api.get("/franchise"), api.get("/merchants/direct-merchant")]);
        setFranchises(fRes.data || []);
        setDirectMerchants(dRes.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load franchises and merchants");
      }
    };
    loadStatic();
  }, []);

  // merchants of the selected franchise
  useEffect(() => {
    if (type !== "FRANCHISE_MERCHANT" || !selectedFranchiseId) {
      setFranchiseMerchants([]);
      return;
    }
    const load = async () => {
      setLoadingMerchants(true);
      try {
        const res = await api.get(`/merchants/franchise/${selectedFranchiseId}`);
        setFranchiseMerchants(res.data || []);
      } catch (e) {
        console.error(e);
        setFranchiseMerchants([]);
        toast.error("Failed to load the franchise's merchants");
      } finally {
        setLoadingMerchants(false);
      }
    };
    load();
  }, [type, selectedFranchiseId]);

  const changeType = (next) => {
    setType(next);
    setSelectedFranchiseId("");
    setSelectedMerchantIds([]);
    setFranchiseMerchants([]);
  };

  // who already has a URL (the server refuses a second one; this just tells the admin early)
  const franchiseIdsWithUrl = useMemo(
    () => new Set(rows.filter((r) => r.type === "FRANCHISE").map((r) => String(r.franchiseId))),
    [rows]
  );
  const merchantIdsWithUrl = useMemo(
    () => new Set(rows.filter((r) => r.merchantId != null).map((r) => String(r.merchantId))),
    [rows]
  );
  const franchiseUrlFor = (franchiseId) =>
    rows.find((r) => r.type === "FRANCHISE" && String(r.franchiseId) === String(franchiseId))?.callback || null;

  const merchantOptions = type === "FRANCHISE_MERCHANT" ? franchiseMerchants : directMerchants;
  const needsFranchise = type === "FRANCHISE" || type === "FRANCHISE_MERCHANT";
  const needsMerchants = type === "FRANCHISE_MERCHANT" || type === "DIRECT_MERCHANT";

  const franchiseAlreadyHasUrl =
    type === "FRANCHISE" && selectedFranchiseId && franchiseIdsWithUrl.has(String(selectedFranchiseId));

  const targetChosen = (!needsFranchise || selectedFranchiseId) && (!needsMerchants || selectedMerchantIds.length > 0);
  const canSave = targetChosen && looksLikeUrl(url) && !franchiseAlreadyHasUrl && !saving;

  // ── what will happen, shown in the confirmation popup ─────────────────────
  const buildSummary = () => {
    const selectedMerchants = merchantOptions.filter((m) => selectedMerchantIds.includes(String(m.id)));
    const names = selectedMerchants.map(merchantLabel);
    const franchise = franchises.find((f) => String(f.id) === String(selectedFranchiseId));
    const franchiseName = franchise ? franchise.franchiseName : "this franchise";

    if (type === "FRANCHISE") {
      const own = rows.filter((r) => r.type === "FRANCHISE_MERCHANT" && String(r.franchiseId) === String(selectedFranchiseId));
      const notes = [
        {
          tone: "info",
          text: "This URL will receive payments made on the franchise's own devices, and on its merchants' devices that have no URL of their own.",
        },
      ];
      if (own.length > 0) {
        notes.push({
          tone: "info",
          text: `${own.length} merchant${own.length === 1 ? "" : "s"} of this franchise ${own.length === 1 ? "has" : "have"} a URL of their own and ${own.length === 1 ? "is" : "are"} not affected: ${own.map((r) => r.merchantName).join(", ")}.`,
        });
      }
      return { heading: `Add the Notification URL for franchise "${franchiseName}"?`, names: [], notes };
    }

    if (type === "FRANCHISE_MERCHANT") {
      const franchiseUrl = franchiseUrlFor(selectedFranchiseId);
      const selectedSet = new Set(selectedMerchantIds);
      const others = franchiseMerchants.filter((m) => !selectedSet.has(String(m.id)) && !merchantIdsWithUrl.has(String(m.id))).length;
      const n = names.length;

      const notes = [
        { tone: "info", text: `${n === 1 ? "This merchant" : `These ${n} merchants`} will be notified ONLY at this URL.` },
      ];
      if (franchiseUrl) {
        notes.push({
          tone: "warn",
          text: `The franchise's URL (${franchiseUrl}) will no longer receive payments made on ${n === 1 ? "this merchant's" : "these merchants'"} devices.`,
        });
      } else {
        notes.push({ tone: "info", text: "This franchise has no URL of its own." });
      }
      if (others > 0) {
        notes.push(
          franchiseUrl
            ? {
                tone: "info",
                text: `The other ${others} merchant${others === 1 ? "" : "s"} of this franchise without a URL of their own keep using the franchise's URL. Nothing changes for them.`,
              }
            : {
                tone: "warn",
                text: `The other ${others} merchant${others === 1 ? "" : "s"} of this franchise without a URL of their own will not be notified, because the franchise has no URL either.`,
              }
        );
      }
      return {
        heading: `Add this Notification URL for ${n} merchant${n === 1 ? "" : "s"} of "${franchiseName}"?`,
        names,
        notes,
      };
    }

    const n = names.length;
    return {
      heading: `Add this Notification URL for ${n} direct merchant${n === 1 ? "" : "s"}?`,
      names,
      notes: [{ tone: "info", text: `${n === 1 ? "This merchant" : `These ${n} merchants`} will be notified at this URL.` }],
    };
  };

  const openConfirm = (e) => {
    e.preventDefault();
    if (canSave) setConfirming(true);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      let res;
      if (type === "FRANCHISE") {
        res = await api.post("/notification-callbacks", {
          type,
          franchiseId: Number(selectedFranchiseId),
          callback: url.trim(),
        });
      } else {
        const payload = { type, merchantIds: selectedMerchantIds.map(Number), callback: url.trim() };
        if (type === "FRANCHISE_MERCHANT") payload.franchiseId = Number(selectedFranchiseId);
        res = await api.post("/notification-callbacks/bulk", payload);
      }
      toast.success(res.data?.message || "Notification URL added");
      setConfirming(false);
      setUrl("");
      setSelectedMerchantIds([]);
      setSelectedFranchiseId("");
      setFranchiseMerchants([]);
      await loadRows();
    } catch (err) {
      setConfirming(false);
      toast.error(errorMessage(err, "Could not add the Notification URL"), { autoClose: 12000 });
      loadRows(); // the list may have changed since it was loaded
    } finally {
      setSaving(false);
    }
  };

  // ── list filtering (the table is small, so it is done here) ────────────────
  const visibleRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (typeFilter === "ALL" || r.type === typeFilter) &&
        (!text ||
          [r.callback, r.merchantName, r.franchiseName].some((v) => v && v.toLowerCase().includes(text)))
    );
  }, [rows, typeFilter, search]);

  const selectClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow">
        <div className="p-2 bg-white/20 rounded-lg">
          <BellRing className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Notification URL</h1>
          <p className="text-rose-100 text-sm mt-0.5">
            Set where payment notifications are sent for a franchise, a franchise merchant or a direct merchant
          </p>
        </div>
      </div>

      {/* ── Add form ── */}
      <form onSubmit={openConfirm} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="w-5 h-0.5 bg-rose-500 rounded" />
          Add Notification URL
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex flex-wrap gap-5">
            {TYPES.map((t) => (
              <label key={t.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value={t.value}
                  checked={type === t.value}
                  onChange={(e) => changeType(e.target.value)}
                  className="mr-2"
                />
                {t.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{TYPE_HELP[type]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {needsFranchise && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Franchise <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFranchiseId}
                onChange={(e) => {
                  setSelectedFranchiseId(e.target.value);
                  setSelectedMerchantIds([]);
                }}
                className={selectClass}
              >
                <option value="">Choose Franchise</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.franchiseName} - {f.contactPersonName}
                    {type === "FRANCHISE" && franchiseIdsWithUrl.has(String(f.id)) ? "  (URL already set)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {needsMerchants && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Merchants <span className="text-red-500">*</span>
              </label>
              {type === "FRANCHISE_MERCHANT" && !selectedFranchiseId ? (
                <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg p-4">
                  Choose a franchise first to see its merchants
                </p>
              ) : (
                <MerchantMultiSelect
                  options={merchantOptions}
                  selected={selectedMerchantIds}
                  onChange={setSelectedMerchantIds}
                  disabledIds={merchantIdsWithUrl}
                  loading={loadingMerchants}
                  emptyText={type === "FRANCHISE_MERCHANT" ? "This franchise has no merchants" : "There are no direct merchants"}
                />
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              maxLength={255}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/payment-notification"
              className={selectClass}
            />
            <p className={`text-xs mt-1 ${url && !looksLikeUrl(url) ? "text-red-500" : "text-gray-500"}`}>{URL_HINT}</p>
          </div>
        </div>

        {franchiseAlreadyHasUrl && (
          <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            This franchise already has a Notification URL. Edit or delete it in the list below.
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {needsMerchants && selectedMerchantIds.length > 1
              ? `Add Notification URL for ${selectedMerchantIds.length} merchants`
              : "Add Notification URL"}
          </button>
        </div>
      </form>

      {/* ── List ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Notification URLs{" "}
            <span className="text-gray-400 font-normal">
              ({visibleRows.length}
              {visibleRows.length !== rows.length ? ` of ${rows.length}` : ""})
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">All types</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or URL"
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm sm:w-64"
            />
          </div>
        </div>

        {listError && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{listError}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Type", "Name", "Franchise", "Notification URL", "Created", "Last Changed", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingRows ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    {rows.length === 0 ? "No Notification URLs added yet" : "No Notification URLs match these filters"}
                  </td>
                </tr>
              ) : (
                visibleRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[r.type] || TYPE_BADGE.UNKNOWN}`}>
                        {TYPE_LABEL[r.type] || r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {r.merchantName || r.franchiseName || "—"}
                      {r.warning && (
                        <div className="flex items-start gap-1 text-xs text-amber-700 mt-1 max-w-xs whitespace-normal">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {r.warning}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.type === "FRANCHISE" ? "—" : r.franchiseName || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800 max-w-xs break-all" title={r.callback}>
                      {r.callback}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(r.updatedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setEditing(r)} className="text-blue-600 hover:text-blue-800" title="Edit URL">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleting(r)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirming && (
        <ConfirmSaveModal
          summary={buildSummary()}
          url={url.trim()}
          saving={saving}
          onCancel={() => setConfirming(false)}
          onConfirm={handleSave}
        />
      )}
      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadRows();
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          row={deleting}
          franchiseUrl={deleting.type === "FRANCHISE_MERCHANT" ? franchiseUrlFor(deleting.franchiseId) : null}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            loadRows();
          }}
        />
      )}
    </div>
  );
};

export default NotificationCallbacks;
