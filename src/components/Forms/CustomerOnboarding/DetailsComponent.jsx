import { useState, useEffect } from 'react'

import { FileText, X, Download, Eye, Trash2 } from 'lucide-react'
import api from "../../../constants/API/axiosInstance"
import { toast } from 'react-toastify'


// Form validation patterns
const VALIDATION_PATTERNS = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    mobile: /^[6-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// File validation
const FILE_CONSTRAINTS = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
}
// Document Preview Component
export const DocumentPreview = ({ documentPath, documentName, onClose }) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [blobUrl, setBlobUrl] = useState(null)

    const cleanPath = documentPath
        ?.replace(/\\\\/g, '/')
        ?.replace(/\\/g, '/')
        ?.replace(/^\/+/, '')

    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(cleanPath || '')
    const isPdf = /\.pdf$/i.test(cleanPath || '')
    const filename = cleanPath?.split('/').pop()
    const apiUrl = cleanPath ? `/file/files/${cleanPath}` : null

    useEffect(() => {
        if (!apiUrl) return

        const fetchFile = async () => {
            try {
                setLoading(true)
                const response = await api.get(apiUrl, { responseType: 'blob' })
                const blob = response.data
                const url = window.URL.createObjectURL(blob)
                setBlobUrl(url)
                setLoading(false)
            } catch (error) {
                console.error('File fetch error:', error)
                setError('Failed to load document.')
                setLoading(false)
            }
        }

        fetchFile()

        return () => {
            if (blobUrl) {
                window.URL.revokeObjectURL(blobUrl)
            }
        }
    }, [apiUrl])

    const handleDownload = async () => {
        try {
            const response = await api.get(apiUrl, { responseType: 'blob' })
            const blob = response.data
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename || 'download'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            toast.error('Download failed. Please try again.')
        }
    }

    if (!cleanPath) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
                    <p className="text-gray-600 mb-4">The document path is invalid or missing.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold">{documentName}</h3>
                        <p className="text-sm text-gray-500">{filename}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Download">
                            <Download className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Close">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <span className="text-gray-600">Loading document...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <h4 className="text-lg font-semibold mb-2">Error Loading Document</h4>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Try Download
                            </button>
                        </div>
                    )}

                    {isImage && !error && blobUrl && (
                        <div className="flex justify-center">
                            <img src={blobUrl} alt={documentName} className="max-w-full h-auto rounded-lg shadow-lg" />
                        </div>
                    )}

                    {isPdf && !error && blobUrl && (
                        <iframe src={`${blobUrl}#toolbar=1`} className="w-full h-[600px] border-0 rounded-lg shadow-lg" title={documentName} />
                    )}

                    {!isImage && !isPdf && !error && !loading && (
                        <div className="text-center py-8">
                            <h4 className="text-lg font-semibold mb-2">Preview Not Available</h4>
                            <p className="text-gray-600 mb-4">This document type cannot be previewed. You can download it to view.</p>
                            <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Download Document
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Reusable Form Components
const FormInput = ({ label, name, register, errors, required = false, type = "text", pattern, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            {...register(name, {
                required: required && `${label} is required`,
                pattern: pattern && {
                    value: pattern,
                    message: `Invalid ${label} format`
                }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        />
        {errors[name] && (
            <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
    </div>
)

const FormSelect = ({ label, name, register, errors, required = false, options, placeholder, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            {...register(name, { required: required && `${label} is required` })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {errors[name] && (
            <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
    </div>
)

const FormTextarea = ({ label, name, register, errors, required = false, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            {...register(name, { required: required && `${label} is required` })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        />
        {errors[name] && (
            <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
    </div>
)



const DocumentUpload = ({ label, name, register, errors, required = false, existingFile = null, onPreview = null, onDelete = null }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>

        {existingFile && (
            <div className="mb-2 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Current file uploaded</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => onPreview?.(existingFile, label)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center space-x-1"
                        >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                        </button>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(name)}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center space-x-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register(name, {
                required: required && !existingFile && `${label} is required`,
                validate: {
                    fileSize: (files) => {
                        if (!files[0]) return true
                        return files[0].size <= FILE_CONSTRAINTS.maxSize || 'File size must be less than 5MB'
                    },
                    fileType: (files) => {
                        if (!files[0]) return true
                        return FILE_CONSTRAINTS.allowedTypes.includes(files[0].type) || 'Only PDF, JPG, and PNG files are allowed'
                    }
                }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
            Accepted formats: PDF, JPG, PNG (Max 5MB)
            {existingFile && " • Upload new file to replace existing one"}
        </p>
        {errors[name] && (
            <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
    </div>
)

// Customer Type Selection
export const CustomerTypeSelection = ({ onSelect }) => (
    <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-8 text-gray-800">Select Customer Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button
                onClick={() => onSelect('franchise')}
                className="group p-8 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
                <h3 className="text-xl font-semibold mb-2">Franchise</h3>
                <p className="text-gray-600">Register as a franchise owner with multiple locations</p>
            </button>

            <button
                onClick={() => onSelect('merchant')}
                className="group p-8 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏪</div>
                <h3 className="text-xl font-semibold mb-2">Merchant</h3>
                <p className="text-gray-600">Register as an individual merchant business</p>
            </button>
        </div>
    </div>
)

// Franchise Selection Component
export const FranchiseSelectionForm = ({ register, errors, franchises, loading }) => {
    const [association, setAssociation] = useState("franchise") // default can be 'franchise' or 'independent'

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Franchise Association</h3>

            {/* Radio buttons */}
            <div className="flex items-center space-x-6 mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="radio"
                        value="independent"
                        checked={association === "independent"}
                        onChange={() => setAssociation("independent")}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Independent Merchant</span>
                </label>

                <label className="flex items-center space-x-2">
                    <input
                        type="radio"
                        value="franchise"
                        checked={association === "franchise"}
                        onChange={() => setAssociation("franchise")}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Belongs to Franchise</span>
                </label>
            </div>

            {/* Franchise dropdown only if "franchise" is selected */}
            {association === "franchise" && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading franchises...</span>
                        </div>
                    ) : (
                        <FormSelect
                            label="Select Franchise"
                            name="franchiseId"
                            register={register}
                            errors={errors}
                            required
                            options={franchises}
                            placeholder="Choose the franchise"
                        />
                    )}
                </>
            )}
        </div>
    )
}

// Step Components
export const BasicDetailsForm = ({
    register,
    errors,
    customerType,
    panVerified,
    setPanVerified,
    onVerifyPan,
    watch
}) => (
    <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {customerType === 'franchise' ? 'Franchise' : 'Merchant'} Basic Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
                label={customerType === 'franchise' ? 'Franchise Name' : 'Business Name'}
                name="businessName"
                register={register}
                errors={errors}
                required
                placeholder="Enter business name"
            />

            <FormInput
                label="Legal Entity Name"
                name="legalName"
                register={register}
                errors={errors}
                required
                placeholder="As per registration documents"
            />

            <FormInput
                label="Business Type"
                name="businessType"
                register={register}
                errors={errors}
                required
                placeholder="Enter business type"
            />

            <FormInput
                label="GST Number"
                name="gstNumber"
                register={register}
                errors={errors}
                pattern={VALIDATION_PATTERNS.gst}
                placeholder="Enter GST number"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter PAN number"
                        {...register("panNumber", {
                            required: "PAN Number is required",
                            pattern: {
                                value: VALIDATION_PATTERNS.pan,
                                message: "Invalid PAN Number format"
                            }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="button"
                        onClick={() => onVerifyPan(watch("panNumber"))}
                        className={`px-4 py-2 rounded text-white ${panVerified
                            ? "bg-green-600"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {panVerified ? "Verified ✓" : "Verify"}
                    </button>
                </div>

                {errors.panNumber && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.panNumber.message}
                    </p>
                )}
            </div>

            <FormInput
                label="Registration Number"
                name="registrationNumber"
                register={register}
                errors={errors}

                placeholder="Company/Shop registration number"
            />
        </div>

        <div className="mt-4">
            <FormTextarea
                label="Business Address"
                name="businessAddress"
                register={register}
                errors={errors}
                required
                rows={3}
                placeholder="Complete business address"
            />
        </div>
    </div>
)

export const ContactDetailsForm = ({ register, errors }) => (
    <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
                label="Primary Contact Name"
                name="primaryContactName"
                register={register}
                errors={errors}
                required
                placeholder="Contact person name"
            />

            <FormInput
                label="Primary Contact Mobile"
                name="primaryContactMobile"
                register={register}
                errors={errors}
                required
                type="tel"
                pattern={VALIDATION_PATTERNS.mobile}
                placeholder="Primary mobile number"
            />

            <FormInput
                label="Primary Contact Email"
                name="primaryContactEmail"
                register={register}
                errors={errors}
                required
                type="email"
                pattern={VALIDATION_PATTERNS.email}
                placeholder="Primary email address"
            />

            <FormInput
                label="Alternate Mobile"
                name="alternateContactMobile"
                register={register}
                errors={errors}
                type="tel"
                pattern={VALIDATION_PATTERNS.mobile}
                placeholder="Alternate mobile number"
            />

            <FormInput
                label="Landline Number"
                name="landlineNumber"
                register={register}
                errors={errors}
                type="tel"
                placeholder="Landline with STD code"
            />
        </div>
    </div>
)

export const BankDetailsForm = ({
    register,
    errors,
    bankVerified,
    setBankVerified,
    onVerifyBank,
    watch
}) => (
    <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Account Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
                label="Bank Name"
                name="bankName"
                register={register}
                errors={errors}
                required
                placeholder="Enter bank name"
            />

            <FormInput
                label="Account Holder Name"
                name="accountHolderName"
                register={register}
                errors={errors}
                required
                placeholder="As per bank records"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    placeholder="Bank account number"
                    {...register("accountNumber", {
                        required: "Account Number is required"
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.accountNumber.message}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Bank IFSC code"
                        {...register("ifscCode", {
                            required: "IFSC Code is required",
                            pattern: {
                                value: VALIDATION_PATTERNS.ifsc,
                                message: "Invalid IFSC format"
                            }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            onVerifyBank(
                                watch("accountNumber"),
                                watch("ifscCode")
                            )
                        }
                        className={`px-4 py-2 rounded text-white whitespace-nowrap ${bankVerified
                                ? "bg-green-600"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {bankVerified ? "Verified ✓" : "Verify"}
                    </button>
                </div>

                {errors.ifscCode && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.ifscCode.message}
                    </p>
                )}
            </div>



            <FormInput
                label="Branch Name"
                name="branchName"
                register={register}
                errors={errors}
                required
                placeholder="Bank branch name"
            />

            <FormSelect
                label="Account Type"
                name="accountType"
                register={register}
                errors={errors}
                required
                options={[
                    { value: 'current', label: 'Current Account' },
                    { value: 'savings', label: 'Savings Account' }
                ]}
            />
        </div>
    </div>
)


export const DocumentsForm = ({ register, errors, existingFiles = null, onDocumentPreview = null, onDocumentDelete = null }) => (
    <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUpload
                label="PAN Card"
                name="panCardDocument"
                register={register}
                errors={errors}
                required
                existingFile={existingFiles?.panCardDocument || existingFiles?.panProof}
                onPreview={onDocumentPreview}
                onDelete={onDocumentDelete}
            />

            <DocumentUpload
                label="GST Certificate"
                name="gstCertificate"
                register={register}
                errors={errors}
                existingFile={existingFiles?.gstCertificate || existingFiles?.gstCertificateProof}
                onPreview={onDocumentPreview}
                onDelete={onDocumentDelete}
            />

            <DocumentUpload
                label="Address Proof"
                name="addressProof"
                register={register}
                errors={errors}
                required
                existingFile={existingFiles?.addressProof}
                onPreview={onDocumentPreview}
                onDelete={onDocumentDelete}
            />

            <DocumentUpload
                label="Bank Account Proof"
                name="bankProof"
                register={register}
                errors={errors}
                required
                existingFile={existingFiles?.bankProof || existingFiles?.bankAccountProof}
                onPreview={onDocumentPreview}
                onDelete={onDocumentDelete}
            />
        </div>
    </div>
)