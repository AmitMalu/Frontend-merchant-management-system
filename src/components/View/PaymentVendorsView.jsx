// src/components/View/PaymentVendorsView.jsx
import React from "react";
import { X } from "lucide-react";

const PaymentVendorsView = ({ isOpen, onClose, vendor }) => {
    if (!isOpen || !vendor) return null;

    const { vendorName, supportedModes, status, createdAt, updatedAt } = vendor;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col">
                {/* header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between rounded-t-xl text-white">
                    <div>
                        <h3 className="text-lg font-semibold">Payment Vendor Details</h3>
                        <p className="text-sm text-blue-100 mt-0.5">View vendor configuration</p>
                    </div>
                    <div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-1 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                            <p className="font-semibold text-gray-800">{vendorName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {status ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Created At</p>
                            <p className="text-sm text-gray-700">
                                {createdAt ? new Date(createdAt).toLocaleString() : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                            <p className="text-sm text-gray-700">
                                {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Supported Payment Modes</p>
                        <div className="flex flex-wrap gap-2">
                            {supportedModes && supportedModes.length > 0 ? (
                                supportedModes.map((mode, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                                    >
                                        {mode}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No modes configured</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This vendor supports the payment modes listed above.
                            Ensure proper credentials are configured for integration.
                        </p>
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

export default PaymentVendorsView;