// src/components/View/PaymentChargesView.jsx
import React from "react";
import { X } from "lucide-react";

// ─── Scope badge ──────────────────────────────────────────────────────────────
const SCOPE_META = {
    GLOBAL:             { label: "Global",              color: "bg-blue-100 text-blue-700" },
    DIRECT_MERCHANT:    { label: "Direct Merchant",     color: "bg-green-100 text-green-700" },
    FRANCHISE:          { label: "Franchise",           color: "bg-purple-100 text-purple-700" },
    FRANCHISE_MERCHANT: { label: "Franchise Merchant",  color: "bg-orange-100 text-orange-700" },
};

const ScopeBadge = ({ scope }) => {
    const meta = SCOPE_META[scope] ?? { label: scope, color: "bg-gray-100 text-gray-700" };
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
            {meta.label}
        </span>
    );
};

// ─── Info row helper ──────────────────────────────────────────────────────────
const InfoRow = ({ label, children }) => (
    <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-800">{children}</div>
    </div>
);

// ─── Main view ────────────────────────────────────────────────────────────────
const PaymentChargesView = ({ isOpen, onClose, charge }) => {
    if (!isOpen || !charge) return null;

    /*
     * Support both old response shape  { mode: { code, description }, ... }
     * and new flat shape               { modeCode, modeDescription, ... }
     */
    const modeCode        = charge.modeCode        ?? charge.mode?.code        ?? "—";
    const modeDescription = charge.modeDescription ?? charge.mode?.description ?? "—";
    const modeId          = charge.modeId          ?? charge.mode?.id;

    const {
        chargeScope   = "GLOBAL",
        merchantId,
        merchantName,
        franchiseId,
        franchiseName,
        status,
        createdAt,
        slabs = []
    } = charge;

    const showMerchant  = chargeScope === "DIRECT_MERCHANT" || chargeScope === "FRANCHISE_MERCHANT";
    const showFranchise = chargeScope === "FRANCHISE"       || chargeScope === "FRANCHISE_MERCHANT";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Payment Charge — {modeCode}
                        </h3>
                        <p className="text-sm text-gray-300 mt-0.5">
                            {modeDescription}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* ── Core details grid ── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <InfoRow label="Mode">
                            <span className="font-mono">{modeCode}</span>
                            {modeId && <span className="text-gray-400 text-xs ml-1">(ID: {modeId})</span>}
                        </InfoRow>

                        <InfoRow label="Charge Scope">
                            <ScopeBadge scope={chargeScope} />
                        </InfoRow>

                        <InfoRow label="Status">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                            }`}>
                                {status ? "Active" : "Inactive"}
                            </span>
                        </InfoRow>

                        {/* Franchise */}
                        {showFranchise && (
                            <InfoRow label="Franchise">
                                {franchiseName
                                    ? <>{franchiseName} <span className="text-gray-400 text-xs">(ID: {franchiseId})</span></>
                                    : franchiseId ? `ID: ${franchiseId}` : "—"
                                }
                            </InfoRow>
                        )}

                        {/* Merchant */}
                        {showMerchant && (
                            <InfoRow label="Merchant">
                                {merchantName
                                    ? <>{merchantName} <span className="text-gray-400 text-xs">(ID: {merchantId})</span></>
                                    : merchantId ? `ID: ${merchantId}` : "—"
                                }
                            </InfoRow>
                        )}

                        {createdAt && (
                            <InfoRow label="Created At">
                                {new Date(createdAt).toLocaleString("en-IN")}
                            </InfoRow>
                        )}
                    </div>

                    {/* ── Slabs ── */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Charge Slabs
                            <span className="ml-2 text-xs font-normal text-gray-400">
                                ({slabs.length} slab{slabs.length !== 1 ? "s" : ""})
                            </span>
                        </h4>

                        {slabs.length === 0 ? (
                            <p className="text-sm text-gray-400 bg-gray-50 p-4 rounded-lg border border-dashed">
                                No slabs configured
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {slabs.map((s, i) => (
                                    <div key={s.id ?? i}
                                        className="grid grid-cols-4 gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm hover:border-gray-300 transition-colors"
                                    >
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Min Amount</p>
                                            <p className="font-semibold text-gray-800">
                                                ₹{Number(s.minAmount).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Max Amount</p>
                                            <p className="font-semibold text-gray-800">
                                                ₹{Number(s.maxAmount).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Type</p>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                                s.chargeType === "FLAT"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}>
                                                {s.chargeType}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Charge</p>
                                            <p className="font-semibold text-gray-800">
                                                {s.chargeType === "FLAT"
                                                    ? `₹${Number(s.chargeValue).toLocaleString("en-IN")}`
                                                    : `${s.chargeValue}%`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentChargesView;
