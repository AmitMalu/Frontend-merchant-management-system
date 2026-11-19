import React, { useState } from "react";
import { RouterIcon, Info } from "lucide-react";
import RoutingsTab from "./RoutingsTab";
import ProductVendorsTab from "./ProductVendorsTab";
import SimulatorTab from "./SimulatorTab";
import PayoutEngineTab from "./PayoutEngineTab";
import MenuRulesTab from "./MenuRulesTab";
import HistoryTab from "./HistoryTab";

const TABS = [
  { key: "routings", label: "Routings" },
  { key: "vendors", label: "Product Vendors" },
  { key: "simulator", label: "Check a Merchant" },
  { key: "engine", label: "Payout Engine" },
  { key: "menus", label: "Menu Rules" },
  { key: "history", label: "History" },
];

/**
 * Admin > Payment > Payment Vendor Routing.
 * Phase 1: the settings are saved and checked here, but payments do not use them yet.
 */
const PaymentRoutingPage = () => {
  const [tab, setTab] = useState("routings");

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center space-x-3">
        <RouterIcon className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Vendor Routing</h1>
          <p className="text-gray-600">
            Choose which vendors a product uses, in what order, with what limits, and which merchants get it.
          </p>
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info size={18} className="mt-0.5 shrink-0" />
        <span>
          Payouts use these settings only when "Use routing for payouts" is switched on (Payout Engine tab). Menus
          and the credit card screens follow routing only for the accounts chosen in the Menu Rules tab. Both apply
          only to accounts that have a routing assigned. Bill payment for other categories does not use them yet.
          Otherwise, saving a routing here does not change how anyone pays.
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "routings" && <RoutingsTab />}
      {tab === "vendors" && <ProductVendorsTab />}
      {tab === "simulator" && <SimulatorTab />}
      {tab === "engine" && <PayoutEngineTab />}
      {tab === "menus" && <MenuRulesTab />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
};

export default PaymentRoutingPage;
