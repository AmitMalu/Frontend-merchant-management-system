import React from "react";
import { X } from "lucide-react";

const mask = (value) => {
    if (!value) return "-";
    if (value.length <= 4) return "**";
    const first = value.slice(0, 3);
    const last = value.slice(-2);
    return `${first}${"*".repeat(value.length - 5)}${last}`;
};

const PaymentVendorCredentialsView = ({ isOpen, onClose, creds }) => {

    if (!isOpen || !creds) return null;


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-semibold">Vendor Credentials Details</h3>
                        <p className="text-sm text-blue-100 mt-0.5">Securely view credential metadata</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Vendor</p>
                            <p className="font-semibold text-gray-800">{creds.vendorId}-{creds.vendorName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Product</p>
                            <p className="font-semibold text-gray-800">{creds.productId || "-"}-{creds.productName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Environment</p>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {creds.activeEnvironment}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${creds.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                                }`}>
                                {creds.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Created On</p>
                            <p className="text-sm text-gray-800">{creds.createdOn ? new Date(creds.createdOn).toLocaleString() : "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Updated On</p>
                            <p className="text-sm text-gray-800">{creds.updatedOn ? new Date(creds.updatedOn).toLocaleString() : "-"}</p>
                        </div>
                    </div>


                    {/* UAT Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="font-semibold text-gray-700 mb-3">UAT / Sandbox Details</p>

                        <div className="space-y-2 text-sm">
                            <div><strong>Base URL:</strong> {creds.baseUrlUat || "-"}</div>
                            <div><strong>Secret Key:</strong> {mask(creds.secretKeyUat)}</div>
                            <div><strong>Salt Key:</strong> {mask(creds.saltKeyUat)}</div>
                            <div><strong>Encrypt/Decrypt Key:</strong> {mask(creds.encryptDecryptKeyUat)}</div>
                            <div><strong>User ID:</strong> {mask(creds.userIdUat)}</div>
                        </div>
                    </div>

                    {/* Prod Section */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <p className="font-semibold text-red-700 mb-3">Production Details</p>

                        <div className="space-y-2 text-sm">
                            <div><strong>Base URL:</strong> {creds.baseUrlProd || "-"}</div>
                            <div><strong>Secret Key:</strong> {mask(creds.secretKeyProd)}</div>
                            <div><strong>Salt Key:</strong> {mask(creds.saltKeyProd)}</div>
                            <div><strong>Encrypt/Decrypt Key:</strong> {mask(creds.encryptDecryptKeyProd)}</div>
                            <div><strong>User ID:</strong> {mask(creds.userIdProd)}</div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
                </div>

            </div>
        </div>
    );
};

export default PaymentVendorCredentialsView;
