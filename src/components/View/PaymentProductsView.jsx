import React from "react";
import { X } from "lucide-react";

const PaymentProductsView = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    const { productName, productCode, status, createdAt, updatedAt, allowedModes } = product;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between rounded-t-xl text-white">
                    <div>
                        <h3 className="text-lg font-semibold">Payment Product Details</h3>
                        <p className="text-sm text-purple-100 mt-0.5">View product configuration</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Product Name</p>
                            <p className="font-semibold text-gray-800">{productName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Product Code</p>
                            <p className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded inline-block">
                                {productCode}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
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

                    {/* Allowed Modes */}
                    <div>
                        <p className="text-sm text-gray-700 font-semibold mb-2">Allowed Modes</p>

                        {allowedModes && allowedModes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {allowedModes.map((m) => (
                                    <span
                                        key={m.id}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium"
                                    >
                                        {m.code}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No modes assigned</p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Allowed modes determine which payment channels
                            this product supports.
                        </p>
                    </div>
                </div>

                {/* Footer */}
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

export default PaymentProductsView;
