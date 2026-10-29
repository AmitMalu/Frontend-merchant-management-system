import React, { useEffect, useMemo, useState } from "react";
import { BellRing, Pencil, Trash2, AlertTriangle, Plus } from "lucide-react";
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

// What the URL is used for, shown under the form and in the delete confirmation
const TYPE_HELP = {
  FRANCHISE:
    "Used for payments on the franchise's own devices, and on its merchants' devices that have no URL of their own.",
  FRANCHISE_MERCHANT:
    "Used only for payments on this merchant's devices. If it is removed, the franchise's URL is used instead.",
  DIRECT_MERCHANT: "Used for payments on this merchant's devices.",
};

const DELETE_EFFECT = {
  FRANCHISE:
    "Payments on this franchise's devices (and on its merchants' devices that have no URL of their own) will no longer be sent anywhere.",
  FRANCHISE_MERCHANT:
    "Payments on this merchant's devices will go to the franchise's URL instead (if the franchise has one).",
  DIRECT_MERCHANT: "Payments on this merchant's devices will no longer be sent anywhere.",
  UNKNOWN: "This record is not used by any payment, so nothing changes.",
};

const URL_HINT = "Must start with http:// or https:// (https is recommended). Up to 255 characters.";

const looksLikeUrl = (value) => /^https?:\/\/\S+$/i.test(value.trim()) && value.trim().length <= 255;

const errorMessage = (e, fallback) => e?.response?.data?.message || fallback;

const formatDate = (v) => (v ? new Date(v).toLocaleString("en-IN") : "—");

const Spinner = ({ className = "h-4 w-4" }) => (
  <div className={`animate-spin border-2 border-white border-t-transparent rounded-full ${className}`} />
);

// ─── Edit modal ──────────────────────────────────────────────────────────────
const EditModal = ({ row, onClose, onSaved }) => {
  const [url, setUrl] = useState(row.callback || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!looksLikeUrl(url)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Edit Notification URL</h3>
        <div className="text-sm text-gray-600">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mr-2 ${TYPE_BADGE[row.type]}`}>
            {TYPE_LABEL[row.type]}
          </span>
          <strong>{row.merchantName || row.franchiseName || "—"}</strong>
          {row.type === "FRANCHISE_MERCHANT" && row.franchiseName ? ` (${row.franchiseName})` : ""}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification URL</label>
          <input
            type="url"
            value={url}
            maxLength={255}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">{URL_HINT}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !looksLikeUrl(url)}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Spinner />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirmation ─────────────────────────────────────────────────────
const DeleteModal = ({ row, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Delete Notification URL?</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>{row.merchantName || row.franchiseName || "This record"}</strong>
            <span className="text-gray-500"> ({TYPE_LABEL[row.type]})</span>
          </p>
          <p className="font-mono text-xs break-all bg-gray-50 border rounded p-2">{row.callback}</p>
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{DELETE_EFFECT[row.type]}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={deleting} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <Spinner />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
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
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [url, setUrl] = useState("");
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
    setSelectedMerchantId("");
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

  const merchantOptions = type === "FRANCHISE_MERCHANT" ? franchiseMerchants : directMerchants;
  const needsFranchise = type === "FRANCHISE" || type === "FRANCHISE_MERCHANT";
  const needsMerchant = type === "FRANCHISE_MERCHANT" || type === "DIRECT_MERCHANT";

  const alreadyHasUrl =
    (type === "FRANCHISE" && selectedFranchiseId && franchiseIdsWithUrl.has(String(selectedFranchiseId))) ||
    (needsMerchant && selectedMerchantId && merchantIdsWithUrl.has(String(selectedMerchantId)));

  const targetChosen = (!needsFranchise || selectedFranchiseId) && (!needsMerchant || selectedMerchantId);
  const canSave = targetChosen && looksLikeUrl(url) && !alreadyHasUrl && !saving;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    const payload = { type, callback: url.trim() };
    if (needsFranchise) payload.franchiseId = Number(selectedFranchiseId);
    if (needsMerchant) payload.merchantId = Number(selectedMerchantId);

    setSaving(true);
    try {
      await api.post("/notification-callbacks", payload);
      toast.success("Notification URL added");
      setUrl("");
      setSelectedMerchantId("");
      setSelectedFranchiseId("");
      setFranchiseMerchants([]);
      await loadRows();
    } catch (err) {
      toast.error(errorMessage(err, "Could not add the Notification URL"));
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
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
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
                  setSelectedMerchantId("");
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

          {needsMerchant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Merchant <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                disabled={loadingMerchants || (type === "FRANCHISE_MERCHANT" && !selectedFranchiseId)}
                className={selectClass}
              >
                <option value="">
                  {type === "FRANCHISE_MERCHANT" && !selectedFranchiseId ? "Choose a franchise first" : "Choose Merchant"}
                </option>
                {merchantOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.businessName} - {m.contactPersonName}
                    {merchantIdsWithUrl.has(String(m.id)) ? "  (URL already set)" : ""}
                  </option>
                ))}
              </select>
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

        {alreadyHasUrl && (
          <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            This {type === "FRANCHISE" ? "franchise" : "merchant"} already has a Notification URL. Edit or delete it in the list below.
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Spinner /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : "Add Notification URL"}
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
