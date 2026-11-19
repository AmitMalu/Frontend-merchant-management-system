import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { errorMessage, getFranchises, getMenuRules, getMerchants, saveMenuRules } from "./routingApi";

const MODES = [
  {
    key: "OFF",
    title: "Off (today)",
    text: "Every merchant and franchise sees every menu, as always. This is the safe default.",
  },
  {
    key: "PILOT",
    title: "Only these accounts",
    text: "The rules apply only to the accounts you choose below. Everyone else keeps every menu.",
  },
  {
    key: "ON",
    title: "Everyone",
    text: "The rules apply to every merchant and franchise.",
  },
];

/**
 * Menu Rules: which menus a merchant or franchise sees, from the routings assigned to it.
 *  - Payout shows only if the account has a Payout routing.
 *  - Bill Pay (Bill Avenue) and Credit Card (SuivrePay) show only if the account has a Bill Payment routing, and
 *    then only the screen of the vendor that routing puts first for the Credit Card category.
 * The Merchant Settings switches (Payout, Credit Card Bill Payment) still apply on top.
 */
const MenuRulesTab = () => {
  const [mode, setMode] = useState("OFF");
  const [savedMode, setSavedMode] = useState("OFF");
  const [options, setOptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await getMenuRules();
      setMode(s.mode);
      setSavedMode(s.mode);
      setAccounts(
        s.accounts.map((a) => ({
          value: `${a.type}:${a.id}`,
          label: `${a.name} (${a.type === "MERCHANT" ? "Merchant" : "Franchise"})`,
          type: a.type,
          id: a.id,
        }))
      );
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the menu rules"));
    }
  }, []);

  useEffect(() => {
    load();
    Promise.all([getMerchants(), getFranchises()])
      .then(([m, f]) =>
        setOptions(
          [
            ...m.filter((x) => x.businessName).map((x) => ({ value: `MERCHANT:${x.id}`, label: `${x.businessName} (Merchant)`, type: "MERCHANT", id: x.id })),
            ...f.filter((x) => x.franchiseName).map((x) => ({ value: `FRANCHISE:${x.id}`, label: `${x.franchiseName} (Franchise)`, type: "FRANCHISE", id: x.id })),
          ].sort((a, b) => a.label.localeCompare(b.label))
        )
      )
      .catch(() => setOptions([]));
  }, [load]);

  const save = async () => {
    if (mode === "PILOT" && accounts.length === 0) return toast.error("Choose at least one account");
    const text =
      mode === "ON"
        ? "Apply the menu rules to EVERY merchant and franchise? Accounts without a routing will lose the Payout / credit card menus. You can switch back at any time."
        : mode === "PILOT"
        ? `Apply the menu rules only to ${accounts.length} account(s)?`
        : "Switch the menu rules off? Every account will see every menu again.";
    if (!window.confirm(text)) return;
    setSaving(true);
    try {
      await saveMenuRules(mode, accounts.map((a) => ({ type: a.type, id: a.id })));
      toast.success("Saved. It takes effect within about 15 seconds. Merchants see it after they reload the page.");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const changed = mode !== savedMode || mode === "PILOT";

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Menus follow routing</h3>
          <span className="text-xs text-gray-500">
            Now: <strong>{savedMode === "OFF" ? "Off" : savedMode === "PILOT" ? "Only these accounts" : "Everyone"}</strong>
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
            <label className="mb-1 block text-xs font-medium text-gray-600">Accounts the rules apply to</label>
            <Select
              isMulti
              options={options}
              value={accounts}
              onChange={(v) => setAccounts(v || [])}
              placeholder="Search a merchant or franchise..."
              className="text-sm"
              closeMenuOnSelect={false}
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving || !changed}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <span className="text-xs text-gray-500">A change takes effect within about 15 seconds.</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">What an account sees when the rules apply to it</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Payout</strong> menu: only if it has a <strong>Payout</strong> routing (switched on).
          </li>
          <li>
            <strong>Bill Payment</strong> and <strong>Credit Card</strong> menus: only if it has a{" "}
            <strong>Bill Payment</strong> routing. Then:
            <ul className="mt-1 list-[circle] space-y-1 pl-5">
              <li>
                Vendor 1 for the Credit Card category is <strong>Bill Avenue</strong>: the merchant keeps the Bill Pay
                screen, and the Credit Card (SuivrePay) menu is hidden.
              </li>
              <li>
                Vendor 1 is <strong>SuivrePay</strong>: the merchant keeps the Credit Card menu, and only the Bill Pay
                screen is hidden (Transaction Status and the complaint screens stay, so past payments can be followed).
              </li>
            </ul>
          </li>
          <li>
            A <strong>franchise</strong> has no Bill Pay screen. It keeps Credit Card unless its routing offers only
            Bill Avenue.
          </li>
          <li>
            The Merchant Settings switches still apply on top: a menu works only when its switch is ON.
          </li>
          <li>
            For credit card, the server also refuses the screen of the other vendor, even if someone opens its address
            directly. Nothing is debited.
          </li>
          <li>
            The Payout rule hides the menu only. Payouts themselves are not refused by this rule.
          </li>
        </ul>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-900">Safe by design</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Off is the default. Admins are never affected.</li>
          <li>
            Any error, or a vendor that is not recognised by its name (it must contain "Bill Avenue" or "SuivrePay"),
            shows every menu instead of hiding one.
          </li>
          <li>
            Try it with <strong>Only these accounts</strong> first. Use <strong>Check a Merchant</strong> to see an
            account's routing before you switch it on.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuRulesTab;
