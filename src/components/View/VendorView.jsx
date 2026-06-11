import React from 'react';
import {
    X, Building2, Phone, Mail, MapPin, FileText, Calendar,
    User, Hash, CheckCircle, XCircle
} from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children }) => (
    <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
            <Icon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
            {children}
        </div>
    </div>
);

const InfoField = ({ label, value, icon: Icon, className = "" }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            <p className="text-sm text-gray-900">{value || 'N/A'}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const isActive = status === true;
    return (
        <div className="flex items-center space-x-2">
            {isActive ? (
                <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                    </span>
                </>
            ) : (
                <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                    </span>
                </>
            )}
        </div>
    );
};

const VendorViewModal = ({ vendor, isOpen, onClose }) => {
    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
                            <p className="text-sm text-gray-500">Complete vendor information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Basic Information */}
                    <InfoSection title="Basic Information" icon={Hash}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="Vendor ID"
                                value={`#${vendor.id}`}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                <StatusBadge status={vendor.status} />
                            </div>
                            <InfoField
                                label="Vendor Name"
                                value={vendor.name}
                                className="md:col-span-2"
                            />
                            <InfoField
                                label="Bank Type"
                                value={vendor.bankType}
                            />
                        </div>
                    </InfoSection>

                    {/* Contact Information */}
                    <InfoSection title="Contact Person Information" icon={User}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <InfoField
                                label="Contact Person"
                                value={vendor.contactPerson?.name}
                            />
                            <InfoField
                                label="Phone Number"
                                value={vendor.contactPerson?.phoneNumber}
                                icon={Phone}
                            /> */}
                            <InfoField
                                label="Email Address"
                                value={vendor.contactPerson?.email}
                                icon={Mail}
                                className="md:col-span-2"
                            />
                        </div>
                    </InfoSection>

                    {/* Address Information */}
                    <InfoSection title="Address Information" icon={MapPin}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="Street Address"
                                value={vendor.address}
                                className="md:col-span-2"
                            />
                            <InfoField
                                label="City"
                                value={vendor.city}
                            />
                            <InfoField
                                label="State"
                                value={vendor.state}
                            />
                            <InfoField
                                label="PIN Code"
                                value={vendor.pinCode}
                            />
                        </div>
                    </InfoSection>

                    {/* Legal Information */}
                    <InfoSection title="Legal Information" icon={FileText}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="GST Number"
                                value={vendor.gstNumber}
                            />
                            <InfoField
                                label="PAN Number"
                                value={vendor.pan}
                            />
                        </div>
                    </InfoSection>

                    {/* Agreement Terms */}
                    <InfoSection title="Agreement Terms" icon={Calendar}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="Agreement Start Date"
                                value={vendor.agreementStartDate}
                            />
                            <InfoField
                                label="Agreement End Date"
                                value={vendor.agreementEndDate}
                            />
                            <InfoField
                                label="Credit Period"
                                value={`${vendor.creditPeriodDays} days`}
                                icon={Calendar}
                            />
                            <InfoField
                                label="Payment Terms"
                                value={vendor.paymentTerms}
                            />
                            {vendor.remarks && (
                                <InfoField
                                    label="Remarks"
                                    value={vendor.remarks}
                                    className="md:col-span-2"
                                />
                            )}
                        </div>
                    </InfoSection>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorViewModal;