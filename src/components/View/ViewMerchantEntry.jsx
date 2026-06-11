import { X, Store, Mail, MapPin, Wallet, TrendingUp, Package } from 'lucide-react'

const DetailRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">{label}:</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
};

const ViewMerchantEntry = ({ merchantData, onClose, isOpen }) => {
    if (!isOpen || !merchantData) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <Store className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Merchant Details – {merchantData.businessName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Business Information */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Business Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                            <div>
                                <DetailRow label="Business Name" value={merchantData.businessName} />
                                <DetailRow label="Business Type" value={merchantData.businessType} />
                                <DetailRow label="Merchant ID" value={merchantData.id} />
                            </div>
                            <div>
                                <DetailRow label="Status" value={merchantData.status} />
                                <DetailRow label="Franchise" value={merchantData.franchiseName} />
                                <DetailRow
                                    label="Created Date"
                                    value={merchantData.createdAt ? new Date(merchantData.createdAt).toLocaleDateString() : null}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                            <div>
                                <DetailRow label="Contact Person" value={merchantData.contactPersonName} />
                                <DetailRow label="Email" value={merchantData.contactPersonEmail} />
                            </div>
                            <div>
                                <DetailRow label="Phone" value={merchantData.contactPersonPhone} />
                                <DetailRow label="Address" value={merchantData.address} />
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Financial Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                            <div>
                                <DetailRow
                                    label="Wallet Balance"
                                    value={`₹${merchantData.walletBalance?.toLocaleString() || 0}`}
                                />
                            </div>
                            <div>
                                <DetailRow
                                    label="Monthly Revenue"
                                    value={`₹${merchantData.monthlyRevenue?.toLocaleString() || 0}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products Information */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Products Information
                        </h3>
                        <DetailRow label="Total Products" value={merchantData.products} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewMerchantEntry;