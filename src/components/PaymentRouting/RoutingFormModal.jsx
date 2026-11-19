import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  createRouting,
  errorMessage,
  getProducts,
  getProductVendors,
  inputClass,
  labelClass,
  updateRouting,
} from "./routingApi";

const MAX_VENDORS = 10;

const emptyRow = () => ({
  vendorId: "",
  enabled: true,
  minAmount: "",
  maxAmount: "",
  dailyTransactionLimit: "",
  dailyAmountLimit: "",
  monthlyTransactionLimit: "",
  monthlyAmountLimit: "",
  yearlyTransactionLimit: "",
  yearlyAmountLimit: "",
});

const toNumberOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

/**
 * Create or edit one routing. Vendor 1 is required; every other vendor is optional.
 * The vendor dropdowns list only the vendors linked to the chosen product (Product Vendors tab).
 */
const RoutingFormModal = ({ routing, onClose, onSaved }) => {
  const editing = !!routing;

  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]); // vendors linked to the chosen product
  const [productId, setProductId] = useState(routing ? String(routing.productId) : "");
  const [name, setName] = useState(routing?.name || "");
  const [status, setStatus] = useState(routing ? routing.status : true);
  const [retryCount, setRetryCount] = useState(routing ? routing.retryCount : 3);
  const [retryWaitSeconds, setRetryWaitSeconds] = useState(routing ? routing.retryWaitSeconds : 3);
  const [rows, setRows] = useState(
    routing
      ? routing.vendors.map((v) => ({
          vendorId: String(v.vendorId),
          enabled: v.enabled,
          minAmount: v.minAmount ?? "",
          maxAmount: v.maxAmount ?? "",
          dailyTransactionLimit: v.dailyTransactionLimit ?? "",
          dailyAmountLimit: v.dailyAmountLimit ?? "",
          monthlyTransactionLimit: v.monthlyTransactionLimit ?? "",
          monthlyAmountLimit: v.monthlyAmountLimit ?? "",
          yearlyTransactionLimit: v.yearlyTransactionLimit ?? "",
          yearlyAmountLimit: v.yearlyAmountLimit ?? "",
        }))
      : [emptyRow()]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!productId) {
      setLinks([]);
      return;
    }
    getProductVendors(productId)
      .then((list) => setLinks(list.filter((l) => l.enabled && l.vendorActive)))
      .catch(() => setLinks([]));
  }, [productId]);

  const linkOf = (vendorId) => links.find((l) => String(l.vendorId) === String(vendorId));

  const chosenIds = useMemo(() => rows.map((r) => r.vendorId).filter(Boolean), [rows]);

  const changeProduct = (value) => {
    setProductId(value);
    setRows([emptyRow()]); // the vendors depend on the product
  };

  const setRow = (index, patch) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const move = (index, delta) =>
    setRows((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!productId) return toast.error("Choose a product");
    if (name.trim().length < 2) return toast.error("Enter a routing name");
    if (!rows[0]?.vendorId) return toast.error("Vendor 1 is required");
    if (rows.some((r) => !r.vendorId)) return toast.error("Choose a vendor in every row, or remove the empty row");

    const payload = {
      productId: Number(productId),
      name: name.trim(),
      status,
      retryCount: toNumberOrNull(retryCount) ?? 3,
      retryWaitSeconds: toNumberOrNull(retryWaitSeconds) ?? 3,
      vendors: rows.map((r) => ({
        vendorId: Number(r.vendorId),
        enabled: r.enabled,
        minAmount: toNumberOrNull(r.minAmount),
        maxAmount: toNumberOrNull(r.maxAmount),
        dailyTransactionLimit: toNumberOrNull(r.dailyTransactionLimit),
        dailyAmountLimit: toNumberOrNull(r.dailyAmountLimit),
        monthlyTransactionLimit: toNumberOrNull(r.monthlyTransactionLimit),
        monthlyAmountLimit: toNumberOrNull(r.monthlyAmountLimit),
        yearlyTransactionLimit: toNumberOrNull(r.yearlyTransactionLimit),
        yearlyAmountLimit: toNumberOrNull(r.yearlyAmountLimit),
      })),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateRouting(routing.id, payload);
        toast.success("Routing updated");
      } else {
        await createRouting(payload);
        toast.success("Routing created");
      }
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the routing"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <form onSubmit={submit} className="my-6 w-full max-w-4xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Routing" : "Add Routing"}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Product *</label>
              <select
                className={inputClass}
                value={productId}
                onChange={(e) => changeProduct(e.target.value)}
                disabled={editing}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} | {p.productCode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Routing name *</label>
              <input
                className={inputClass}
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="For example: Payout - Main"
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={status ? "on" : "off"} onChange={(e) => setStatus(e.target.value === "on")}>
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Vendors, in order</h3>
              <button
                type="button"
                disabled={!productId || rows.length >= MAX_VENDORS || rows.length >= links.length}
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
                className="flex items-center gap-1 rounded border border-blue-600 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} /> Add vendor
              </button>
            </div>

            {!productId ? (
              <p className="rounded bg-gray-50 p-4 text-sm text-gray-500">Choose a product to see its vendors.</p>
            ) : links.length === 0 ? (
              <p className="rounded bg-amber-50 p-4 text-sm text-amber-800">
                No vendor is linked to this product yet. Link vendors first in the Product Vendors tab.
              </p>
            ) : (
              <div className="space-y-3">
                {rows.map((row, index) => {
                  const link = linkOf(row.vendorId);
                  return (
                    <div key={index} className="rounded-lg border border-gray-200 p-3">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                          Vendor {index + 1}
                          {index === 0 ? " (required)" : ""}
                        </span>
                        <select
                          className={`${inputClass} max-w-xs`}
                          value={row.vendorId}
                          onChange={(e) => setRow(index, { vendorId: e.target.value })}
                        >
                          <option value="">Select vendor</option>
                          {links
                            .filter((l) => String(l.vendorId) === String(row.vendorId) || !chosenIds.includes(String(l.vendorId)))
                            .map((l) => (
                              <option key={l.vendorId} value={l.vendorId}>
                                {l.vendorName}
                              </option>
                            ))}
                        </select>
                        {link?.categories && (
                          <span className="text-xs text-gray-500">Serves only: {link.categories}</span>
                        )}
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            disabled={index === 0}
                            onChange={(e) => setRow(index, { enabled: e.target.checked })}
                          />
                          On
                        </label>
                        <div className="ml-auto flex gap-1">
                          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Move up">
                            <ArrowUp size={16} />
                          </button>
                          <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Move down">
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                            disabled={index === 0}
                            className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-30"
                            title="Remove (Vendor 1 cannot be removed)"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <NumberField label="Min amount per transaction" value={row.minAmount} onChange={(v) => setRow(index, { minAmount: v })} />
                        <NumberField label="Max amount per transaction" value={row.maxAmount} onChange={(v) => setRow(index, { maxAmount: v })} />
                        <NumberField label="Daily transactions" value={row.dailyTransactionLimit} onChange={(v) => setRow(index, { dailyTransactionLimit: v })} step="1" />
                        <NumberField label="Daily amount" value={row.dailyAmountLimit} onChange={(v) => setRow(index, { dailyAmountLimit: v })} />
                        <NumberField label="Monthly transactions" value={row.monthlyTransactionLimit} onChange={(v) => setRow(index, { monthlyTransactionLimit: v })} step="1" />
                        <NumberField label="Monthly amount" value={row.monthlyAmountLimit} onChange={(v) => setRow(index, { monthlyAmountLimit: v })} />
                        <NumberField label="Yearly transactions" value={row.yearlyTransactionLimit} onChange={(v) => setRow(index, { yearlyTransactionLimit: v })} step="1" />
                        <NumberField label="Yearly amount" value={row.yearlyAmountLimit} onChange={(v) => setRow(index, { yearlyAmountLimit: v })} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500">
                  Leave a limit empty for no limit. Limits are per vendor (all merchants together), and pending
                  payments count toward them. Monthly means the calendar month. Yearly means the calendar year, unless
                  the server is set to start the year in another month (for example April). A longer period cannot be
                  smaller than a shorter one. Payouts check these limits; other products do not use them yet.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <NumberField label="Retries on the same vendor" value={retryCount} onChange={setRetryCount} step="1" />
            <NumberField label="Wait between attempts (seconds)" value={retryWaitSeconds} onChange={setRetryWaitSeconds} step="1" />
            <p className="col-span-2 self-end text-xs text-gray-500">
              After the retries are used up, the next vendor is tried. Retries and switching only happen when a vendor
              clearly did not process the payment.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : editing ? "Save changes" : "Create routing"}
          </button>
        </div>
      </form>
    </div>
  );
};

const NumberField = ({ label, value, onChange, step = "0.01" }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      type="number"
      min="0"
      step={step}
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default RoutingFormModal;
