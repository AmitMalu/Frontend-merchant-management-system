import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  assignAccounts,
  errorMessage,
  getAssignments,
  getUnassigned,
  labelClass,
  unassignAccounts,
} from "./routingApi";

/**
 * Who gets this routing. An account has one routing per product; the account sees the product only when it
 * has a routing (once the menu rule is switched on).
 */
const AssignmentsModal = ({ routing, onClose }) => {
  const [assigned, setAssigned] = useState([]);
  const [options, setOptions] = useState([]);
  const [type, setType] = useState("MERCHANT");
  const [picked, setPicked] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const keyOf = (a) => `${a.type}:${a.id}`;

  const loadAssigned = useCallback(async () => {
    try {
      setAssigned(await getAssignments(routing.id));
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the assigned accounts"));
    }
  }, [routing.id]);

  const loadOptions = useCallback(async () => {
    try {
      const list = await getUnassigned(routing.productId, type);
      setOptions(list.map((o) => ({ value: o.id, label: o.name, type: o.type })));
    } catch (err) {
      setOptions([]);
      toast.error(errorMessage(err, "Could not load the accounts"));
    }
  }, [routing.productId, type]);

  useEffect(() => {
    loadAssigned();
  }, [loadAssigned]);

  useEffect(() => {
    setPicked([]);
    loadOptions();
  }, [loadOptions]);

  const shown = useMemo(
    () => assigned.filter((a) => a.name.toLowerCase().includes(search.trim().toLowerCase())),
    [assigned, search]
  );

  const assign = async () => {
    if (picked.length === 0) return toast.error("Choose at least one account");
    setBusy(true);
    try {
      await assignAccounts(
        routing.id,
        picked.map((p) => ({ type, id: p.value }))
      );
      toast.success(`${picked.length} account(s) assigned`);
      setPicked([]);
      await Promise.all([loadAssigned(), loadOptions()]);
    } catch (err) {
      toast.error(errorMessage(err, "Could not assign"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (checked.size === 0) return;
    if (!window.confirm(`Remove ${checked.size} account(s) from "${routing.name}"? They will have no routing for ${routing.productName}.`)) return;
    setBusy(true);
    try {
      const targets = assigned.filter((a) => checked.has(keyOf(a))).map((a) => ({ type: a.type, id: a.id }));
      await unassignAccounts(routing.id, targets);
      toast.success(`${targets.length} account(s) removed`);
      setChecked(new Set());
      await Promise.all([loadAssigned(), loadOptions()]);
    } catch (err) {
      toast.error(errorMessage(err, "Could not remove"));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (a) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(keyOf(a)) ? next.delete(keyOf(a)) : next.add(keyOf(a));
      return next;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-6 w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Accounts on "{routing.name}"</h2>
            <p className="text-xs text-gray-500">{routing.productName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Add accounts</h3>
            <div className="mb-3 flex gap-4 text-sm">
              {["MERCHANT", "FRANCHISE"].map((t) => (
                <label key={t} className="flex items-center gap-1">
                  <input type="radio" checked={type === t} onChange={() => setType(t)} />
                  {t === "MERCHANT" ? "Merchants" : "Franchises"}
                </label>
              ))}
            </div>
            <label className={labelClass}>
              Accounts with no routing for {routing.productName} ({options.length})
            </label>
            <Select
              isMulti
              options={options}
              value={picked}
              onChange={(v) => setPicked(v || [])}
              placeholder="Search and select..."
              className="text-sm"
              closeMenuOnSelect={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setPicked(options)} disabled={options.length === 0} className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                Select all {options.length}
              </button>
              <button onClick={() => setPicked([])} disabled={picked.length === 0} className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                Clear
              </button>
              <button onClick={assign} disabled={busy || picked.length === 0} className="ml-auto rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                Assign {picked.length || ""}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-800">Assigned ({assigned.length})</h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="max-w-xs flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <button onClick={remove} disabled={busy || checked.size === 0} className="ml-auto flex items-center gap-1 rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40">
                <Trash2 size={14} /> Remove {checked.size || ""}
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
              {shown.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">No accounts.</p>
              ) : (
                shown.map((a) => (
                  <label key={keyOf(a)} className="flex cursor-pointer items-center gap-3 border-b px-4 py-2 text-sm last:border-b-0 hover:bg-gray-50">
                    <input type="checkbox" checked={checked.has(keyOf(a))} onChange={() => toggle(a)} />
                    <span className="flex-1 text-gray-800">{a.name}</span>
                    <span className="text-xs text-gray-500">{a.type === "MERCHANT" ? "Merchant" : "Franchise"} #{a.id}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <button onClick={onClose} className="rounded-lg bg-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsModal;
