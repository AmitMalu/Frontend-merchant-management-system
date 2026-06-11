// Fixed InwardFormModal component
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Download, Loader2, ChevronDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import api from '../../../constants/API/axiosInstance'
import SerialNumberGrid from './SerialGrid'

// Updated schema
const inwardSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  receivedBy: z.string().min(1, 'Received by is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.string().min(1, 'Quantity is required').refine(val => parseInt(val) > 0, 'Quantity must be positive'),
  batchNumber: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  productCondition: z.string().min(1, 'Condition is required'),
  remark: z.string().optional(),
})


// Updated InwardFormModal with fixed serial data handling
const InwardFormModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [serialGridData, setSerialGridData] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dropdown states
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])

  // Loading states
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(inwardSchema),
    defaultValues: editData || {
      productCondition: 'new',
      receivedDate: new Date().toISOString().split('T')[0]
    }
  })

  const quantity = watch('quantity')
  const selectedVendorId = watch('vendorId')

  // // ✅ FIXED: Debug logging to track serial data
  // useEffect(() => {
  //   console.log("serialGridData updated:", serialGridData);
  // }, [serialGridData]);

  // ✅ FIXED: Proper serial grid change handler
  const handleSerialGridChange = useCallback((newGridData) => {
  //  console.log("Grid changed:", newGridData);
    setSerialGridData(newGridData);
  }, []);

  // Optimized API calls with better error handling
  const fetchVendors = useCallback(async () => {
    try {
      setVendorsLoading(true)
      const response = await api.get('/vendors/id_name')
      const vendorOptions = response.data.map(vendor => ({
        value: vendor.id.toString(),
        label: vendor.name,
        id: vendor.id
      }))
      setVendors(vendorOptions)
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors. Please try again.')
    } finally {
      setVendorsLoading(false)
    }
  }, [])

  const fetchProductsByVendor = useCallback(async (vendorId) => {
    if (!vendorId) {
      setProducts([])
      return
    }

    try {
      setProductsLoading(true)
      const response = await api.get(`/products/vendor/${vendorId}`)
      const productOptions = response.data.map(product => ({
        value: product.id.toString(),
        label: `${product.productCode} - ${product.productName}`,
        productCode: product.productCode,
        productName: product.productName
      }))
      setProducts(productOptions)

      // Clear product selection when vendor changes
      setValue('productId', '')
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      toast.error('Failed to load products for selected vendor.')
    } finally {
      setProductsLoading(false)
    }
  }, [setValue])

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      fetchVendors()
    }
  }, [isOpen, fetchVendors])

  // Load products when vendor changes
  useEffect(() => {
    if (selectedVendorId) {
      fetchProductsByVendor(selectedVendorId)
    }
  }, [selectedVendorId, fetchProductsByVendor])

  // Load edit data into form when editing
  useEffect(() => {
    if (editData && isOpen) {
      // Map backend fields to frontend form fields
      const formData = {
        invoiceNumber: editData.invoiceNumber || '',
        receivedDate: editData.receivedDate
          ? new Date(editData.receivedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        receivedBy: editData.receivedBy || '',
        quantity: editData.quantity?.toString() || '',
        batchNumber: editData.batchNumber || '',
        warrantyPeriod: editData.warrantyPeriod?.toString() || '',
        productCondition: editData.productCondition || 'new',
        remark: editData.remark || ''
      };

      // Set form values
      Object.keys(formData).forEach(key => {
        setValue(key, formData[key]);
      });

      // Handle vendor/product IDs
      if (editData.vendorId) {
        setValue("vendorId", editData.vendorId.toString());
        fetchProductsByVendor(editData.vendorId);
      }

      // ✅ FIXED: Handle serial numbers - don't set serialGridData directly here
      // Let the SerialNumberGrid component handle initialization through initialData prop

    } else if (isOpen && !editData) {
      // Reset on add new
      setSerialGridData([]);
    }
  }, [editData, isOpen, setValue, fetchProductsByVendor]);

  // Once products are loaded, set productId
  useEffect(() => {
    if (products.length > 0 && editData?.productId) {
      setValue("productId", editData.productId.toString())
    }
  }, [products, editData, setValue])

  // Once vendors are loaded, set vendorId
  useEffect(() => {
    if (vendors.length > 0 && editData?.vendorId) {
      setValue("vendorId", editData.vendorId.toString())
    }
  }, [vendors, editData, setValue])

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' },
    { value: 'damaged', label: 'Damaged' }
  ]

  

  const handleFormSubmit = async (data) => {
    console.log('Form data:', data)
    console.log('Serial grid data:', serialGridData)

    setIsSubmitting(true)
    try {
      // ✅ Transform serial grid to backend format
      const transformSerialGridToBackend = (gridData) => {
        console.log('Transforming grid data:', gridData)

        const transformed = gridData
          .filter(row => {
            const hasAnySelected = row.selectedFields.MID ||
              row.selectedFields.SID ||
              row.selectedFields.TID ||
              row.selectedFields.VpID;
            return hasAnySelected;
          })
          .map(row => ({
            mid: row.selectedFields.MID && row.MID ? row.MID : null,
            sid: row.selectedFields.SID && row.SID ? row.SID : null,
            tid: row.selectedFields.TID && row.TID ? row.TID : null,
            vpaid: row.selectedFields.VpID && row.VpID ? row.VpID : null
          }));

        console.log('Final transformed array:', transformed);
        return transformed;
      };

      const serialNumbers = transformSerialGridToBackend(serialGridData);

      

      // ✅ Validation: serialNumbers length must match quantity
      if (data.quantity && serialNumbers.length !== Number(data.quantity)) {
        toast.error(`Number of serial numbers (${serialNumbers.length}) does not match quantity (${data.quantity})!`);
        return;
      }

      const submissionData = {
        ...data,
        serialNumbers,
        ...(editData?.id && { id: editData.id })
      }

      console.log('Final submission data:', submissionData);

      reset();
      setSerialGridData([]);
      onClose();
      await onSubmit(submissionData);

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = useCallback(() => {
    reset()
    setSerialGridData([])
    setProducts([])
    onClose()
  }, [reset, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">
            {editData ? 'Edit Inward Entry' : 'Add New Inward Entry'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Invoice & Vendor Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Invoice & Vendor Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('invoiceNumber')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.invoiceNumber ? 'border-red-500' : ''
                        }`}
                      placeholder="Enter invoice number"
                      disabled={isSubmitting}
                    />
                    {errors.invoiceNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register('vendorId')}
                        className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.vendorId ? 'border-red-500' : ''
                          } ${vendorsLoading ? 'opacity-50' : ''}`}
                        disabled={isSubmitting || vendorsLoading}
                      >
                        <option value="">
                          {vendorsLoading ? 'Loading vendors...' : 'Select vendor'}
                        </option>
                        {vendors.map(vendor => (
                          <option key={vendor.value} value={vendor.value}>
                            {vendor.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        {vendorsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {errors.vendorId && (
                      <p className="mt-1 text-sm text-red-600">{errors.vendorId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Received Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('receivedDate')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.receivedDate ? 'border-red-500' : ''
                        }`}
                      disabled={isSubmitting}
                    />
                    {errors.receivedDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.receivedDate.message}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register('productId')}
                        className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.productId ? 'border-red-500' : ''
                          } ${productsLoading || !selectedVendorId ? 'opacity-50' : ''}`}
                        disabled={isSubmitting || productsLoading || !selectedVendorId}
                      >
                        <option value="">
                          {!selectedVendorId
                            ? 'Select vendor first'
                            : productsLoading
                              ? 'Loading products...'
                              : 'Select product'
                          }
                        </option>
                        {products.map(product => (
                          <option key={product.value} value={product.value}>
                            {product.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        {productsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {errors.productId && (
                      <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
                    )}
                    {!selectedVendorId && (
                      <p className="mt-1 text-sm text-gray-500">Please select a vendor to load products</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('quantity')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-500' : ''
                        }`}
                      placeholder="Enter quantity"
                      min="1"
                      disabled={isSubmitting}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Received By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('receivedBy')}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.receivedBy ? 'border-red-500' : ''
                        }`}
                      placeholder="Enter receiver name"
                      disabled={isSubmitting}
                    />
                    {errors.receivedBy && (
                      <p className="mt-1 text-sm text-red-600">{errors.receivedBy.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    {...register('batchNumber')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter batch number"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Period (months)
                  </label>
                  <input
                    type="number"
                    {...register('warrantyPeriod')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter warranty period"
                    min="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('productCondition')}
                      className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.productCondition ? 'border-red-500' : ''
                        }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select condition</option>
                      {conditionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {errors.productCondition && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCondition.message}</p>
                  )}
                </div>
              </div>

              {/* ✅ FIXED: Serial Number Grid with proper data flow */}
              <SerialNumberGrid
                quantity={quantity}
                onGridChange={handleSerialGridChange}
                initialData={editData?.serialNumbers || []}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  {...register('remark')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter any additional remarks"
                  disabled={isSubmitting}
                />
              </div>
            </div>

         

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSubmitting
                    ? (editData ? 'Updating...' : 'Saving...')
                    : (editData ? 'Update Entry' : 'Save Entry')
                  }
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InwardFormModal