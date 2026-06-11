import React from 'react';
import { X } from 'lucide-react';

const PaymentVendorRoutingView = ({ selectedRouting, onClose }) => {
    if (!selectedRouting) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-semibold">Vendor Routing Details</h2>
                        <p className="text-blue-100 text-sm mt-0.5">
                            Product: {selectedRouting.payoutProductName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Product Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <p><span className="font-medium">Product ID:</span> {selectedRouting.payoutProductId}</p>
                            <p><span className="font-medium">Status:</span>{' '}
                                {selectedRouting.status ? (
                                    <span className="text-green-600 font-semibold">Active</span>
                                ) : (
                                    <span className="text-gray-500 font-semibold">Inactive</span>
                                )}
                            </p>
                            <p className="col-span-2">
                                <span className="font-medium">Created At:</span>{' '}
                                {new Date(selectedRouting.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Vendor Priority (V1 → V2 → V3)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                <p className="font-medium text-gray-800 mb-1">Priority 1</p>
                                {selectedRouting.vendor1 ? (
                                    <>
                                        <p><span className="font-medium">Vendor ID:</span> {selectedRouting.vendor1.id}</p>
                                        <p><span className="font-medium">Name:</span> {selectedRouting.vendor1.name}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Not Assigned</p>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                <p className="font-medium text-gray-800 mb-1">Priority 2</p>
                                {selectedRouting.vendor2 ? (
                                    <>
                                        <p><span className="font-medium">Vendor ID:</span> {selectedRouting.vendor2.id}</p>
                                        <p><span className="font-medium">Name:</span> {selectedRouting.vendor2.name}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Not Assigned</p>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                <p className="font-medium text-gray-800 mb-1">Priority 3</p>
                                {selectedRouting.vendor3 ? (
                                    <>
                                        <p><span className="font-medium">Vendor ID:</span> {selectedRouting.vendor3.id}</p>
                                        <p><span className="font-medium">Name:</span> {selectedRouting.vendor3.name}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Not Assigned</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Vendor Rules
                        </h3>
                        <div className="space-y-3">
                            {selectedRouting.vendorRules?.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-800">
                                            {rule.vendorName}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            Vendor ID: {rule.vendorId}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
                                        <p><span className="font-medium">Min Amount:</span> ₹{rule.minAmount}</p>
                                        <p><span className="font-medium">Max Amount:</span> ₹{rule.maxAmount}</p>
                                        <p><span className="font-medium">Txn Limit:</span> {rule.dailyTransactionLimit}</p>
                                        <p><span className="font-medium">Daily Limit:</span> ₹{rule.dailyAmountLimit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentVendorRoutingView;