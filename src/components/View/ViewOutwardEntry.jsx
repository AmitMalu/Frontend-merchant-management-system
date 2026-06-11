import { X, Truck, Package } from 'lucide-react'

const DetailRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">{label}:</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
};

const ViewOutwardEntry = ({ outwardData, onClose, isOpen }) => {
    if (!isOpen || !outwardData) return null;

    // Determine customer name based on available data
    const customerName = outwardData.franchiseName || outwardData.merchantName || 'N/A';
    const customerType = outwardData.franchiseName ? 'Franchise' : outwardData.merchantName ? 'Merchant' : 'Unknown';

    // Format delivery method
    const deliveryMethodLabels = {
        'courier': 'Courier',
        'self_pickup': 'Self Pickup',
        'direct_delivery': 'Direct Delivery',
        'logistics_partner': 'Logistics Partner'
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <Truck className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Outward Entry – {outwardData.deliveryNumber}
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
                    {/* Customer & Delivery Section */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Customer & Delivery Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                            <div className="">
                                <DetailRow label="Delivery Number" value={outwardData.deliveryNumber} />
                                <DetailRow label="Customer Name" value={customerName} />
                                <DetailRow label="Customer Type" value={customerType} />
                                <DetailRow label="Contact Person" value={outwardData.contactPerson} />
                            </div>
                            <div className="">
                                <DetailRow label="Dispatch Date" value={outwardData.dispatchDate} />
                                <DetailRow label="Dispatched By" value={outwardData.dispatchedBy} />
                                <DetailRow label="Contact Number" value={outwardData.contactPersonNumber} />
                                <DetailRow
                                    label="Delivery Method"
                                    value={deliveryMethodLabels[outwardData.deliveryMethod] || outwardData.deliveryMethod}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Delivery Address
                        </h3>
                        <p className="text-gray-900">{outwardData.deliveryAddress}</p>
                    </div>

                    {/* Product Section */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Product Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                            <div className="">
                                <DetailRow label="Product Code" value={outwardData.productCode} />
                                <DetailRow label="Product Name" value={outwardData.productName} />
                            </div>
                            <div className="">
                                <DetailRow label="Quantity" value={outwardData.quantity} />
                                <DetailRow label="Tracking Number" value={outwardData.trackingNumber} />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {(outwardData.trackingNumber || outwardData.expectedDeliveryDate) && (
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                Shipping Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
                                <div className="">
                                    <DetailRow label="Tracking Number" value={outwardData.trackingNumber} />
                                </div>
                                <div className="">
                                    <DetailRow label="Expected Delivery" value={outwardData.expectedDeliveryDate} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Serial Numbers */}
                    {outwardData.serialNumbers?.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                                <Package className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Serial Numbers ({outwardData.serialNumbers.length} items)
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100 text-left">
                                        <tr>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">#</th>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">TID</th>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">SID</th>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">MID</th>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">VPAID</th>
                                            <th className="p-3 border text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {outwardData.serialNumbers.map((serial, index) => (
                                            <tr key={serial.id || index} className="hover:bg-gray-50">
                                                <td className="p-3 border text-sm font-medium">{index + 1}</td>
                                                <td className="p-3 border text-sm font-mono">{serial.tid || "-"}</td>
                                                <td className="p-3 border text-sm font-mono">{serial.sid || "-"}</td>
                                                <td className="p-3 border text-sm font-mono">{serial.mid || "-"}</td>
                                                <td className="p-3 border text-sm font-mono">{serial.vpaid || "-"}</td>
                                                <td className="p-3 border text-sm font-mono">{serial.mobNumber || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {outwardData.remarks && (
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                Remarks
                            </h3>
                            <p className="text-gray-900">{outwardData.remarks}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewOutwardEntry;