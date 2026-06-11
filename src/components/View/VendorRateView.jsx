import { X, Building2, Package, CreditCard, Calendar, FileText, DollarSign } from 'lucide-react'

const VendorRateView = ({ vendorData, onClose, isOpen }) => {
    if (!isOpen || !vendorData) return null

    const formatCurrency = (amount) => {
        return amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : 'N/A'
    }

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A'
    }

    // Calculate status
    const getStatus = () => {
        const currentDate = new Date()
        const effectiveDate = new Date(vendorData.effectiveDate)
        const expiryDate = vendorData.expiryDate ? new Date(vendorData.expiryDate) : null

        if (expiryDate && currentDate > expiryDate) {
            return { status: 'Expired', color: 'text-red-600 bg-red-100' }
        } else if (currentDate >= effectiveDate) {
            return { status: 'Active', color: 'text-green-600 bg-green-100' }
        } else {
            return { status: 'Pending', color: 'text-yellow-600 bg-yellow-100' }
        }
    }

    const statusInfo = getStatus()

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Vendor Rate Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Status Badge */}
                    <div className="mb-6">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Vendor Information */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Vendor Name</label>
                                    <p className="text-gray-900 mt-1">{vendorData.vendorName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Vendor ID</label>
                                    <p className="text-gray-900 mt-1 font-mono text-sm">{vendorData.vendorId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <Package className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                                    <p className="text-gray-900 mt-1">{vendorData.productName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Code</label>
                                    <p className="text-gray-900 mt-1 font-mono text-sm">{vendorData.productCode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="mt-6 bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                                <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(vendorData.monthlyRent)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Rates */}
                    <div className="mt-6">
                        <div className="flex items-center mb-4">
                            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Card Rates</h3>
                        </div>
                        {vendorData.vendorCardRates && vendorData.vendorCardRates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vendorData.vendorCardRates.map((rate, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{rate.cardType}</p>
                                                <p className="text-lg font-bold text-purple-600">{rate.rate}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 bg-gray-50 rounded-lg p-4 text-center">No card rates configured</p>
                        )}
                    </div>

                    {/* Date Information */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Date Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Effective Date</label>
                                <p className="text-gray-900 mt-1">{formatDate(vendorData.effectiveDate)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                                <p className="text-gray-900 mt-1">{formatDate(vendorData.expiryDate) !== 'N/A' ? formatDate(vendorData.expiryDate) : 'No expiry'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    {vendorData.remark && (
                        <div className="mt-6">
                            <div className="flex items-center mb-4">
                                <FileText className="h-5 w-5 text-gray-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Remarks</h3>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700">{vendorData.remark}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorRateView