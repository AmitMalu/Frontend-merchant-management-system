import React, { useState, useMemo } from "react";
import FranchiseReports from "./FranchiseReports";
import VendorReports from "./VendorReports";
import FTransReportDashboard from "./FranhiseTransReports/FTransReportDashboard";
import MTransReportDashboard from "./MerchantTransReport/MTransReportDashboard";
import InwardTransactionReport from "./InwardTransactionReports";
import OutwardTransactionReport from "./OutwardTransactionReports";
import ProductReport from "./productReports/ProductReport";
import ReturnTransactionReport from "./ReturnTransactionReports";

const MainReportsPageForNow = () => {
    const [activeTab, setActiveTab] = useState(null);

    // Read userType from localStorage
    const userType = localStorage.getItem("userType").toLowerCase();
    // e.g. "super_admin", "admin", "franchise", "merchant"

    // Define all possible tabs
    const allTabs = [
        { id: "franchise", label: "Franchise Reports", component: <FranchiseReports /> },
        { id: "merchant", label: "Merchant Reports", component: <MerchantReports /> },
        { id: "vendor", label: "Vendor Reports", component: <VendorReports /> },
        { id: "merchant-reports", label: "Merchant Transaction Reports", component: <MTransReportDashboard /> },
        { id: "franchise-reports", label: "Franchise Transaction Reports", component: <FTransReportDashboard /> },
        { id: "inward-transaction-reports", label: "Inward Transaction Reports", component: <InwardTransactionReport /> },
        { id: "outward-transaction-reports", label: "Outward Transaction Reports", component: <OutwardTransactionReport /> },
        { id: "return-transaction-reports", label: "Return Transaction Reports", component: <ReturnTransactionReport /> },
        { id: "product-reports", label: "Product Reports", component: <ProductReport /> },
        { id: "settled-unsettled-reports", label: "Settled Unsettled Reports", component: <SettledUnsettledTransactionReports />}
    ];

    // Filter tabs based on role
    const tabs = useMemo(() => {
        if (userType === "super_admin" || userType === "admin") {
            return allTabs; // full access
        } else if (userType === "franchise") {
            return allTabs.filter(tab =>
                ["merchant-reports", "franchise-reports"].includes(tab.id)
            );
        } else if (userType === "merchant") {
            return allTabs.filter(tab =>
                ["merchant-reports"].includes(tab.id)
            );
        }
        return [];
    }, [userType]);

    return (
        <div className="space-y-6">
            {/* Tab headers */}
            <div className="flex gap-4 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 font-medium transition-colors rounded-t-lg
              ${activeTab === tab.id
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-600 hover:text-indigo-500"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="mt-4">
                {activeTab === null ? (
                    <div className="text-gray-500 text-center py-10">
                        Select a report tab to view data
                    </div>
                ) : (
                    tabs.find(tab => tab.id === activeTab)?.component
                )}
            </div>
        </div>
    );
};

export default MainReportsPageForNow;
