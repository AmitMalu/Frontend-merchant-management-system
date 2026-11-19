import React, { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteRouting,
  errorMessage,
  getProducts,
  getRoutings,
  inputClass,
  labelClass,
  setRoutingStatus,
} from "./routingApi";
import RoutingFormModal from "./RoutingFormModal";
import AssignmentsModal from "./AssignmentsModal";

const RoutingsTab = () => {
  const [routings, setRoutings] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ open: false, routing: null });
  const [assigning, setAssigning] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRoutings(await getRoutings(productId));
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the routings"));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (routing) => {
    const next = !routing.status;
    if (!next && routing.assignedCount > 0) {
      const ok = window.confirm(
        `${routing.assignedCount} account(s) are assigned to "${routing.name}". Switching it off means they have no ` +
          `vendor for ${routing.productName} (once payments use routing). Switch it off?`
      );
      if (!ok) return;
    }
    try {
      await setRoutingStatus(routing.id, next);
      toast.success(next ? "Routing switched on" : "Routing switched off");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not change the status"));
    }
  };

  const remove = async (routing) => {
    if (!window.confirm(`Delete the routing "${routing.name}"?`)) return;
    try {
      await deleteRouting(routing.id);
      toast.success("Routing deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the routing"));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="w-64">
          <label className={labelClass}>Product</label>
          <select className={inputClass} value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName} | {p.productCode}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setForm({ open: true, routing: null })}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Routing
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Routing</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Vendors, in order</th>
              <th className="px-4 py-3">Retries</th>
              <th className="px-4 py-3">Accounts</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : routings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No routing yet. Use Add Routing to create one.
                </td>
              </tr>
            ) : (
              routings.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.productName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {r.vendors.map((v) => (
                        <span
                          key={v.vendorId}
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            v.enabled ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400 line-through"
                          }`}
                          title={limitText(v)}
                        >
                          {v.priority}. {v.vendorName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.retryCount} × {r.retryWaitSeconds}s
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAssigning(r)}
                      className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Users size={14} /> {r.assignedCount} · Manage
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(r)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        r.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                      title="Click to switch"
                    >
                      {r.status ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm({ open: true, routing: r })}
                        className="rounded p-1.5 text-green-600 hover:bg-green-50"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form.open && (
        <RoutingFormModal
          routing={form.routing}
          onClose={() => setForm({ open: false, routing: null })}
          onSaved={() => {
            setForm({ open: false, routing: null });
            load();
          }}
        />
      )}

      {assigning && (
        <AssignmentsModal
          routing={assigning}
          onClose={() => {
            setAssigning(null);
            load();
          }}
        />
      )}
    </div>
  );
};

const limitText = (v) => {
  const parts = [];
  if (v.minAmount != null) parts.push(`min ${v.minAmount}`);
  if (v.maxAmount != null) parts.push(`max ${v.maxAmount}`);
  if (v.dailyTransactionLimit != null) parts.push(`daily count ${v.dailyTransactionLimit}`);
  if (v.dailyAmountLimit != null) parts.push(`daily amount ${v.dailyAmountLimit}`);
  if (v.monthlyTransactionLimit != null) parts.push(`monthly count ${v.monthlyTransactionLimit}`);
  if (v.monthlyAmountLimit != null) parts.push(`monthly amount ${v.monthlyAmountLimit}`);
  if (v.yearlyTransactionLimit != null) parts.push(`yearly count ${v.yearlyTransactionLimit}`);
  if (v.yearlyAmountLimit != null) parts.push(`yearly amount ${v.yearlyAmountLimit}`);
  return parts.length ? parts.join(", ") : "No limits";
};

export default RoutingsTab;
