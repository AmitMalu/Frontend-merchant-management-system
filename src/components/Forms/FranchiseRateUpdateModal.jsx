import { useState, useEffect } from 'react'
import { X, AlertTriangle, Save, RefreshCw } from 'lucide-react'
import api from '../../constants/API/axiosInstance'
import { toast } from 'react-toastify'

const FranchiseRateUpdateModal = ({ assignment, onCancel, onSubmit }) => {
    const [schemeDetails, setSchemeDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [merchantRates, setMerchantRates] = useState({}) // cardName -> merchantRate (string/number)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (assignment?.schemeId) {
            fetchSchemeDetails()
        }
    }, [assignment])

    const fetchSchemeDetails = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/pricing-schemes/${assignment.schemeId}`)
            setSchemeDetails(response.data)
            
            // Pre-fill merchant rates
            const rates = {}
            if (response.data?.cardRates) {
                response.data.cardRates.forEach((cr) => {
                    rates[cr.cardName] = cr.merchantRate !== null && cr.merchantRate !== undefined ? cr.merchantRate : ''
                })
            }
            setMerchantRates(rates)
        } catch (error) {
            console.error('Error fetching scheme details:', error)
            toast.error('Failed to load scheme details')
        } finally {
            setLoading(false)
        }
    }

    const handleRateChange = (cardName, value) => {
        setMerchantRates(prev => ({
            ...prev,
            [cardName]: value
        }))
        
        // Clear error when value changes
        if (errors[cardName]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[cardName]
                return newErrors
            })
        }
    }

    const validateRates = () => {
        const newErrors = {}
        let isValid = true

        if (!schemeDetails?.cardRates) return false

        schemeDetails.cardRates.forEach((cr) => {
            const enteredVal = parseFloat(merchantRates[cr.cardName])
            const franchiseRate = cr.franchiseRate || 0

            if (isNaN(enteredVal)) {
                newErrors[cr.cardName] = 'Rate is required'
                isValid = false
            } else if (enteredVal < franchiseRate) {
                newErrors[cr.cardName] = `Rate cannot be lower than franchise rate (${franchiseRate}%)`
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (!validateRates()) {
            toast.error('Please fix validation errors before submitting.')
            return
        }

        try {
            setUpdating(true)
            
            // Construct payload: List of CardRateDTO
            const payload = schemeDetails.cardRates.map((cr) => ({
                cardName: cr.cardName,
                merchantRate: parseFloat(merchantRates[cr.cardName]),
                franchiseRate: cr.franchiseRate,
                rate: cr.rate
            }))

            await api.put(`/outward-schemes/franchise/update-rate/${assignment.id}`, payload)
            toast.success('Merchant scheme rates updated successfully!')
            onSubmit()
        } catch (error) {
            console.error('Error updating rates:', error)
            toast.error(error?.response?.data?.message || 'Failed to update rates')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading scheme details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Update Merchant Scheme Rates</h2>
                        <p className="text-sm text-gray-500 mt-1">One-time override of merchant rates for this assignment</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                        title="Close"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleFormSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Read-Only Details */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase">Merchant</span>
                                <span className="text-gray-800 font-medium">{assignment?.customerName || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase">Product</span>
                                <span className="text-gray-800 font-medium">{assignment?.productName || 'N/A'} (ID: {assignment?.productId})</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase">Base Scheme Code</span>
                                <span className="text-blue-600 font-semibold">{schemeDetails?.schemeCode || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase">Monthly Rental</span>
                                <span className="text-gray-800 font-medium">₹{schemeDetails?.rentalByMonth || 0}</span>
                            </div>
                        </div>

                        {/* Banner warning */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md flex gap-3">
                            <AlertTriangle className="text-blue-500 flex-shrink-0" size={20} />
                            <div className="text-sm text-blue-700">
                                <strong>Note:</strong> You can only update rates for this assignment <strong>once</strong>. A new scheme will be automatically generated with your custom rates. Your custom rates cannot be lower than the franchise rates set by the admin.
                            </div>
                        </div>

                        {/* Card Rates inputs - grouped product-wise, matching the admin Pricing Scheme UI */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Configure Merchant Rates</h3>

                            {schemeDetails?.cardRates && schemeDetails.cardRates.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                                        <h4 className="font-semibold text-blue-800">
                                            {assignment?.productName || 'Unknown Product'}
                                        </h4>
                                        <p className="text-xs text-blue-600">
                                            {schemeDetails.cardRates.length} card type(s)
                                        </p>
                                    </div>

                                    <div className="p-3 space-y-3">
                                        {schemeDetails.cardRates.map((cr) => (
                                            <div key={cr.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Card Name
                                                        </label>
                                                        <input
                                                            readOnly
                                                            value={cr.cardName}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Category
                                                        </label>
                                                        <input
                                                            readOnly
                                                            value={cr.category || '-'}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Franchise Rate (%)
                                                        </label>
                                                        <input
                                                            readOnly
                                                            value={`${cr.franchiseRate || 0}%`}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Merchant Rate (%) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            value={merchantRates[cr.cardName] ?? ''}
                                                            onChange={(e) => handleRateChange(cr.cardName, e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                errors[cr.cardName] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                            placeholder="0.00"
                                                        />
                                                        {errors[cr.cardName] && (
                                                            <p className="mt-1 text-xs text-red-500 font-medium">{errors[cr.cardName]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                                    <p className="text-sm">No card rates configured for this scheme.</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
                                disabled={updating || !schemeDetails?.cardRates?.length}
                            >
                                {updating ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={18} />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Update Rates
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FranchiseRateUpdateModal
