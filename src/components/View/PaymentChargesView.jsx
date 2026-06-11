// src/components/View/PaymentChargesView.jsx
import React from "react";
import { X } from "lucide-react";

const PaymentChargesView = ({ isOpen, onClose, charge }) => {
    if (!isOpen || !charge) return null;

    const { mode, status, createdAt, slabs = [] } = charge;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-height-[90vh] overflow-auto flex flex-col">

                {/* header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between rounded-t-xl text-white">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Payment Mode Charges — {mode?.code}
                        </h3>
                        <p className="text-sm text-blue-100 mt-0.5">
                            Global payment charge configuration
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Mode */}
                        <div>
                            <p className="text-sm text-gray-600">Mode</p>
                            <p className="font-semibold">
                                {mode?.code} — {mode?.description}
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {status ? "Active" : "Inactive"}
                            </p>
                        </div>

                        {/* Created */}
                        <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="text-sm text-gray-700">
                                {createdAt ? new Date(createdAt).toLocaleString() : "-"}
                            </p>
                        </div>
                    </div>

                    {/* Slabs */}
                    <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="text-sm font-semibold mb-3">Slabs</h4>

                        <div className="space-y-3">
                            {slabs.length === 0 && (
                                <p className="text-sm text-gray-500">No slabs configured</p>
                            )}

                            {slabs.map((s, i) => (
                                <div key={i} className="p-3 bg-white rounded border">
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600 text-xs">Min</p>
                                            <p className="font-medium">
                                                ₹{Number(s.minAmount).toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-600 text-xs">Max</p>
                                            <p className="font-medium">
                                                ₹{Number(s.maxAmount).toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-gray-600 text-xs">Type</p>
                                            <p>{s.chargeType}</p>
                                        </div>

                                        <div>
                                            <p className="text-gray-600 text-xs">Value</p>
                                            <p className="font-medium">
                                                {s.chargeType === "FLAT"
                                                    ? `₹${s.chargeValue}`
                                                    : `${s.chargeValue}%`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentChargesView;
