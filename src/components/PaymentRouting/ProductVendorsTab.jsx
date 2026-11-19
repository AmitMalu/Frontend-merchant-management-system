import React, { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  errorMessage,
  getAllVendors,
  getCategories,
  getProducts,
  getProductVendors,
  inputClass,
  labelClass,
  removeProductVendor,
  saveProductVendor,
} from "./routingApi";

/**
 * Which vendors can serve which product. The routing form lists only these vendors.
 * For a product with several bill categories, "Categories" limits a vendor to some of them
 * (empty = all categories).
 */
const ProductVendorsTab = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productId, setProductId] = useState("");
  const [links, setLinks] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [categories, setCategories] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
    getAllVendors().then(setVendors).catch(() => setVendors([]));
  }, []);

  const [categoryOptions, setCategoryOptions] = useState([]);

  const load = useCallback(async () => {
    if (!productId) {
      setLinks([]);
      setCategoryOptions([]);
      return;
    }
    try {
      setLinks(await getProductVendors(productId));
      // categories are picked from a list, never typed (a product without categories answers an empty list)
      setCategoryOptions((await getCategories(productId)) || []);
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the vendors of this product"));
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const edit = (l) => {
    setVendorId(String(l.vendorId));
    setCategories(l.categories || "");
    setEnabled(l.enabled);
  };

  const reset = () => {
    setVendorId("");
    setCategories("");
    setEnabled(true);
  };

  const save = async () => {
    if (!productId) return toast.error("Choose a product");
    if (!vendorId) return toast.error("Choose a vendor");
    setSaving(true);
    try {
      await saveProductVendor({ productId: Number(productId), vendorId: Number(vendorId), categories, enabled });
      toast.success("Saved");
      reset();
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (l) => {
    if (!window.confirm(`Remove ${l.vendorName} from ${l.productName}?`)) return;
    try {
      await removeProductVendor(l.id);
      toast.success("Removed");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not remove"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="max-w-sm">
        <label className={labelClass}>Product</label>
        <select className={inputClass} value={productId} onChange={(e) => { setProductId(e.target.value); reset(); }}>
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.productName} | {p.productCode}
            </option>
          ))}
        </select>
      </div>

      {productId && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Link a vendor to this product</h3>
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-4">
              <div>
                <label className={labelClass}>Vendor</label>
                <select className={inputClass} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Categories (none chosen = all)</label>
                {categoryOptions.length > 0 ? (
                  <Select
                    isMulti
                    className="text-sm"
                    placeholder="All categories"
                    closeMenuOnSelect={false}
                    options={categoryOptions.map((c) => ({ value: c, label: c }))}
                    value={categories
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((c) => ({ value: c, label: c }))}
                    onChange={(v) => setCategories((v || []).map((o) => o.value).join(", "))}
                  />
                ) : (
                  <p className="py-2 text-xs text-gray-500">This product has no categories.</p>
                )}
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                Switched on
              </label>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  Save
                </button>
                <button onClick={reset} className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300">
                  Clear
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Saving a vendor that is already linked changes its categories or switch. A vendor used by a routing
              cannot be switched off or removed until it is taken out of that routing.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Serves</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No vendor is linked to this product yet.
                    </td>
                  </tr>
                ) : (
                  links.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {l.vendorName}
                        {!l.vendorActive && <span className="ml-2 text-xs text-red-500">(vendor inactive)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.categories || "All categories"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${l.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {l.enabled ? "On" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => edit(l)} className="text-xs text-blue-600 hover:underline">
                            Edit
                          </button>
                          <button onClick={() => remove(l)} className="text-red-600 hover:text-red-800" title="Remove">
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
        </>
      )}
    </div>
  );
};

export default ProductVendorsTab;
