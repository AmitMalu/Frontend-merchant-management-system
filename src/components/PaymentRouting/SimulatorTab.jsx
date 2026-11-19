import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  errorMessage,
  getCategories,
  getFranchises,
  getMerchants,
  getProducts,
  inputClass,
  labelClass,
  simulate,
} from "./routingApi";

/**
 * "Which vendor would this merchant get?" It only explains the saved settings: nothing is reserved or
 * changed. Daily, monthly and yearly limits, vendor health and vendor-wise charges are not part of the check.
 */
const SimulatorTab = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("MERCHANT");
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  // The categories of the chosen product are picked from a list, never typed. A product without categories
  // (Payout) has no category box at all.
  useEffect(() => {
    setCategory("");
    setResult(null);
    if (!productId) {
      setCategories([]);
      return;
    }
    getCategories(productId).then((c) => setCategories(c || [])).catch(() => setCategories([]));
  }, [productId]);

  useEffect(() => {
    setAccount(null);
    setResult(null);
    const load = type === "MERCHANT" ? getMerchants() : getFranchises();
    load
      .then((list) =>
        setAccounts(
          list
            .map((a) => ({ value: a.id, label: type === "MERCHANT" ? a.businessName : a.franchiseName }))
            .filter((o) => o.label)
            .sort((a, b) => a.label.localeCompare(b.label))
        )
      )
      .catch(() => setAccounts([]));
  }, [type]);

  const run = async () => {
    if (!productId) return toast.error("Choose a product");
    if (!account) return toast.error("Choose the merchant or franchise");
    setBusy(true);
    try {
      setResult(
        await simulate({
          productId,
          type,
          accountId: account.value,
          ...(amount !== "" ? { amount } : {}),
          ...(category.trim() ? { category: category.trim() } : {}),
        })
      );
    } catch (err) {
      setResult(null);
      toast.error(errorMessage(err, "Could not check"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Product</label>
            <select className={inputClass} value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} | {p.productCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Account type</label>
            <div className="flex gap-4 py-2 text-sm">
              {["MERCHANT", "FRANCHISE"].map((t) => (
                <label key={t} className="flex items-center gap-1">
                  <input type="radio" checked={type === t} onChange={() => setType(t)} />
                  {t === "MERCHANT" ? "Merchant" : "Franchise"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>{type === "MERCHANT" ? "Merchant" : "Franchise"}</label>
            <Select options={accounts} value={account} onChange={setAccount} placeholder="Search..." className="text-sm" isClearable />
          </div>
          <div>
            <label className={labelClass}>Amount (optional)</label>
            <input type="number" min="0" className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {categories.length > 0 && (
            <div>
              <label className={labelClass}>Category (optional)</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Any category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button onClick={run} disabled={busy} className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {busy ? "Checking..." : "Check"}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">
            {result.accountName}
            {result.routingName ? ` · routing "${result.routingName}"` : ""}
          </p>
          <p className={`mb-4 text-sm font-semibold ${result.chosenVendor ? "text-green-700" : "text-amber-700"}`}>
            {result.message}
          </p>
          {result.vendors.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {result.vendors.map((v) => (
                  <tr key={v.vendorId} className="border-t">
                    <td className="px-3 py-2">{v.priority}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {v.vendorName}
                      {v.vendorName === result.chosenVendor && (
                        <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">chosen</span>
                      )}
                    </td>
                    <td className={`px-3 py-2 ${v.eligible ? "text-green-700" : "text-gray-600"}`}>{v.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulatorTab;
