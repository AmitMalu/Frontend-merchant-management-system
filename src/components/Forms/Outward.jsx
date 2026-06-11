import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, ChevronDown, AlertCircle } from 'lucide-react'
import api from '../../constants/API/axiosInstance'

// Updated Outward schema without unit price and total amount
const outwardSchema = z.object({
  deliveryNumber: z.string().min(1, 'Delivery number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  customerType: z.string().min(1, 'Customer type is required'),
  dispatchDate: z.string().min(1, 'Dispatch date is required'),
  dispatchedBy: z.string().min(1, 'Dispatched by is required'),
  productCategoryId: z.string().min(1, 'Product category is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.string().min(1, 'Quantity is required').refine(val => parseInt(val) > 0, 'Quantity must be positive'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactPersonNumber: z.string().regex(/^[6-9]\d{9}$/, 'Contact number must be a valid 10-digit Indian mobile number'),
  deliveryMethod: z.string().min(1, 'Delivery method is required'),
  trackingNumber: z.string().optional(),
  expectedDelivery: z.string().optional(),
  remarks: z.string().optional(),
})

// Error Display Component
const ErrorAlert = ({ message, onClose }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
    <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
    <span className="text-red-700 text-sm flex-grow">{message}</span>
    {onClose && (
      <button
        onClick={onClose}
        className="text-red-400 hover:text-red-600 ml-2"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
)

// Loading Spinner Component
const LoadingSpinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
}

const SerialNumberGrid = ({ availableSerials = [], quantity, onSelectionChange, loading = false }) => {
  const [selectedSerials, setSelectedSerials] = useState(new Set())

  const maxQuantity = parseInt(quantity) || 0

  // Reset when product changes
  useEffect(() => {
    setSelectedSerials(new Set())
  }, [availableSerials])

  // Clamp when quantity reduces
  useEffect(() => {
    if (selectedSerials.size > maxQuantity) {
      const trimmed = new Set(Array.from(selectedSerials).slice(0, maxQuantity))
      setSelectedSerials(trimmed)
    }
  }, [maxQuantity, selectedSerials])

  // Notify parent
  useEffect(() => {
    const selectedItems = availableSerials.filter(serial => selectedSerials.has(serial.id))
    onSelectionChange?.(selectedItems)
  }, [selectedSerials, availableSerials, onSelectionChange])

  const toggleSelection = useCallback(
    (serialId) => {
      setSelectedSerials(prev => {
        const next = new Set(prev)
        if (next.has(serialId)) {
          next.delete(serialId)
        } else if (next.size < maxQuantity) {
          next.add(serialId)
        }
        return next
      })
    },
    [maxQuantity]
  )

  const handleSelectAll = () => {
    const toSelect = availableSerials.slice(0, maxQuantity).map(s => s.id)
    setSelectedSerials(new Set(toSelect))
  }

  const handleDeselectAll = () => {
    setSelectedSerials(new Set())
  }

  if (loading) {
    return (
      <div className="mt-4 p-8 bg-gray-50 rounded-lg flex items-center justify-center">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-gray-600">Loading serial numbers...</span>
      </div>
    )
  }

  if (availableSerials.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Select a product to view available serial numbers</p>
      </div>
    )
  }

  const selectedCount = selectedSerials.size

  return (
    <div className="mt-4">
      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Serial Numbers Selection ({selectedCount}/{maxQuantity} selected)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={maxQuantity === 0 || selectedCount === maxQuantity}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">MID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">SID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">VPAID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableSerials.map((serial, index) => {
                const isSelected = selectedSerials.has(serial.id)
                const isDisabled = !isSelected && selectedSerials.size >= maxQuantity

                return (
                  <tr
                    key={serial.id}
                    className={`${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => toggleSelection(serial.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{index + 1}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.mid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.sid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.tid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.vpaid || "-"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 text-sm bg-blue-50 p-3 rounded">
        <strong>Summary:</strong> {selectedCount} out of {maxQuantity} required items selected
        {selectedCount > 0 && selectedCount === maxQuantity && (
          <div className="text-green-700 font-medium mt-1">✓ Ready for dispatch</div>
        )}
        {selectedCount !== maxQuantity && maxQuantity > 0 && (
          <div className="text-amber-700 mt-1">⚠ Please select exactly {maxQuantity} items</div>
        )}
      </div>
    </div>
  )
}


// Modular Form Select Component
const FormSelect = ({  label,  name,  register,  errors,  options,  loading,  placeholder,  required = false,  disabled = false, onChange}) => {
  const { onChange: registerOnChange, ...registerRest } = register(name);

  const handleChange = (e) => {
    registerOnChange(e); // This ensures React Hook Form's onChange is called
    if (onChange) {
      onChange(e); // Call any additional onChange handler
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...registerRest}
          onChange={handleChange}
          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
            } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
          disabled={loading || disabled}
        >
          <option value="">
            {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errors[name].message}
        </p>
      )}
    </div>
  );
};
// Main Outward Form Modal Component
const OutwardFormModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSerials, setSelectedSerials] = useState([])
  const [error, setError] = useState(null)

  // Data states
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [availableSerials, setAvailableSerials] = useState([])

  // Loading states  
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [serialsLoading, setSerialsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(outwardSchema),
    defaultValues: editData || {
      deliveryMethod: 'courier',
      dispatchDate: new Date().toISOString().split('T')[0]
    }
  })

  const selectedCategoryId = watch('productCategoryId')
  const selectedProductId = watch('productId')
  const selectedCustomerType = watch('customerType')
  const quantity = watch('quantity')

  // Fetch scheme code on mount for new schemes OR when reusing
  useEffect(() => {
    if (!editData && isOpen) {
      fetchNewDeliveryNumber()
    }
    
  }, [editData])

 const fetchNewDeliveryNumber = async () => {
    try {
      const response = await api.get('/outward-transactions/generate-delivery-number')

      if (response.status === 200) {
        setValue('deliveryNumber', response?.data)
      }
    } catch (error) {
      console.error('Error fetching Delivery Number:', error)
    }
  }   
  

  // API Functions with proper error handling
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    setError(null)
    try {
      const response = await api.get('/product-categories')
      if (response.data && Array.isArray(response.data)) {
        const categoryOptions = response.data.map(category => ({
          value: category.id.toString(),
          label: category.categoryName || category.name || 'Unnamed Category'
        }))
        setCategories(categoryOptions)
      } else {
        throw new Error('Invalid response format for categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError(`Failed to load categories: ${error.response?.data?.message || error.message}`)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  const fetchProductsByCategory = useCallback(async (categoryId) => {
    if (!categoryId) {
      setProducts([])
      return
    }

    setProductsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/products/category/${categoryId}`)
      if (response.data && Array.isArray(response.data)) {
        console.log('Products response:', response.data) // Debug log
        const productOptions = response.data.map(product => ({
          value: product.id.toString(),
          label: `${product.productCode || 'N/A'} - ${product.productName || product.name || 'Unnamed Product'} - ${product.vendor.name || 'No Vendor'}`,
          productCode: product.productCode,
          productName: product.productName || product.name
        }))
        setProducts(productOptions)
      } else {
        throw new Error('Invalid response format for products')
      }
      setValue('productId', '') // Clear product selection when category changes
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(`Failed to load products: ${error.response?.data?.message || error.message}`)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [setValue])

  const fetchCustomers = useCallback(async (customerType) => {
    if (!customerType) {
      setCustomers([])
      return
    }

    setCustomersLoading(true)
    setError(null)
    try {
      const endpoint = customerType === 'franchise' ? '/franchise' : '/merchants/direct-merchant'
      const response = await api.get(endpoint)

      if (response.data && Array.isArray(response.data)) {
        const customerOptions = response.data.map(customer => ({
          value: customer.id.toString(),
          label: customer.name ||
            customer.businessName ||
            customer.franchiseName ||
            customer.merchantName ||
            `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
            `Customer ${customer.id}`,
          id: customer.id
        }))
        setCustomers(customerOptions)
      } else {
        throw new Error('Invalid response format for customers')
      }
      setValue('customerId', '') // Clear customer selection when type changes
    } catch (error) {
      console.error(`Error fetching ${customerType}s:`, error)
      setError(`Failed to load ${customerType}s: ${error.response?.data?.message || error.message}`)
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [setValue])

  const fetchAvailableSerials = useCallback(async (productId) => {
    if (!productId) {
      setAvailableSerials([])
      return
    }

    setSerialsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/inward-transactions/serial-number/${productId}`)
      if (response.data && Array.isArray(response.data)) {
        // Filter out serials that are already assigned to outward transactions
        const availableSerials = response.data.filter(serial =>
          !serial.outwardTransaction || serial.outwardTransaction === null
        )
        setAvailableSerials(availableSerials)
      } else {
        throw new Error('Invalid response format for serial numbers')
      }
    } catch (error) {
      console.error('Error fetching serial numbers:', error)
      setError(`Failed to load serial numbers: ${error.response?.data?.message || error.message}`)
      setAvailableSerials([])
    } finally {
      setSerialsLoading(false)
    }
  }, [])

  // Effects with proper dependency management
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setError(null)
    }
  }, [isOpen, fetchCategories])

  useEffect(() => {
    if (selectedCategoryId) {
      fetchProductsByCategory(selectedCategoryId)
    }
  }, [selectedCategoryId, fetchProductsByCategory])

  useEffect(() => {
    if (selectedCustomerType) {
      fetchCustomers(selectedCustomerType)
    }
  }, [selectedCustomerType, fetchCustomers])

  useEffect(() => {
    if (selectedProductId) {
      fetchAvailableSerials(selectedProductId)
    }
  }, [selectedProductId, fetchAvailableSerials])

  // Load edit data with improved handling
  useEffect(() => {
    if (editData && isOpen) {
      // Load form values
      Object.keys(editData).forEach(key => {
        if (!['selectedSerials', 'productSerialNumbers'].includes(key)) {
          if (editData[key] !== null && editData[key] !== undefined) {
            setValue(key, editData[key].toString())
          }
        }
      })

      // Handle existing serial selections
      if (editData.productSerialNumbers && Array.isArray(editData.productSerialNumbers)) {
        setSelectedSerials(editData.productSerialNumbers)
      }
    } else if (isOpen && !editData) {
      setSelectedSerials([])
      setError(null)
    }
  }, [editData, isOpen, setValue])

  // Form options
  const customerTypeOptions = [
    { value: 'franchise', label: 'Franchise' },
    { value: 'merchant', label: 'Direct Merchant' }
  ]

  const deliveryMethodOptions = [
    { value: 'courier', label: 'Courier' },
    { value: 'self_pickup', label: 'Self Pickup' },
    { value: 'direct_delivery', label: 'Direct Delivery' },
    { value: 'logistics_partner', label: 'Logistics Partner' }
  ]

  const handleFormSubmit = async (data) => {
    const maxQuantity = parseInt(data.quantity) || 0

    // Validation
    if (selectedSerials.length === 0) {
      setError('Please select at least one serial number for outward dispatch')
      return
    }

    if (selectedSerials.length !== maxQuantity) {
      setError(`Please select exactly ${maxQuantity} serial numbers`)
      return
    }

    if (availableSerials.length < maxQuantity) {
      setError(`Not enough serial numbers available. Only ${availableSerials.length} units in stock`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const submissionData = {
        ...data,
        ...(data.customerType === "franchise"
          ? { franchiseId: data.customerId }
          : data.customerType === "merchant"
            ? { merchantId: data.customerId }
            : {}),
        selectedSerialIds: selectedSerials.map(serial => serial.id),
        serialNumbers: selectedSerials
      }
      await onSubmit(submissionData)
      handleClose()
    } catch (error) {
      console.error('Form submission error:', error)
      setError(`Failed to ${editData ? 'update' : 'create'} outward transaction: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedSerials([])
    setProducts([])
    setCustomers([])
    setAvailableSerials([])
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">
            {editData ? 'Edit Outward Entry' : 'Add New Outward Entry'}
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
            {/* Error Display */}
            {error && (
              <ErrorAlert
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* Delivery & Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery & Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Number is auto generated <span className='!text-red-700'> (might change)</span> <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('deliveryNumber')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.deliveryNumber ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      placeholder="Enter delivery number"
                      disabled
                    />
                    {errors.deliveryNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.deliveryNumber.message}
                      </p>
                    )}
                  </div>

                  <FormSelect
                    label="Customer Type"
                    name="customerType"
                    register={register}
                    errors={errors}
                    options={customerTypeOptions}
                    placeholder="Select customer type"
                    required
                    disabled={isSubmitting}
                  />

                  <FormSelect
                    label="Customer"
                    name="customerId"
                    register={register}
                    errors={errors}
                    options={customers}
                    loading={customersLoading}
                    placeholder={!selectedCustomerType ? 'Select customer type first' : 'Select customer'}
                    required
                    disabled={isSubmitting || !selectedCustomerType}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dispatch Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('dispatchDate')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.dispatchDate ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      disabled={isSubmitting}
                    />
                    {errors.dispatchDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.dispatchDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dispatched By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('dispatchedBy')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.dispatchedBy ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      placeholder="Enter dispatcher name"
                      disabled={isSubmitting}
                    />
                    {errors.dispatchedBy && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.dispatchedBy.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Details</h3>
                <div className="space-y-4">
                  <FormSelect
                    label="Product Category"
                    name="productCategoryId"
                    register={register}
                    errors={errors}
                    options={categories}
                    loading={categoriesLoading}
                    placeholder="Select product category"
                    required
                    disabled={isSubmitting}
                  />

                  <FormSelect
                    label="Product"
                    name="productId"
                    register={register}
                    errors={errors}
                    options={products}
                    loading={productsLoading}
                    placeholder={!selectedCategoryId ? 'Select category first' : 'Select product'}
                    required
                    disabled={isSubmitting || !selectedCategoryId}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                      {availableSerials.length >= 0 && (
                        <span className="ml-2 text-sm font-normal text-blue-600">
                          (Available: {availableSerials.length})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      {...register('quantity')}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.quantity ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      placeholder="Enter quantity"
                      min="1"
                      max={availableSerials.length || undefined}
                      disabled={isSubmitting || availableSerials.length===0}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.quantity.message}
                      </p>
                    )}
                    {availableSerials.length > 0 && quantity && parseInt(quantity) > availableSerials.length && (
                      <p className="mt-1 text-sm text-amber-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Quantity exceeds available stock ({availableSerials.length})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Serial Number Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Serial Numbers Selection</h3>
              <SerialNumberGrid
                availableSerials={availableSerials}
                quantity={quantity}
                onSelectionChange={setSelectedSerials}
                loading={serialsLoading}
              />
            </div>

            {/* Delivery Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('deliveryAddress')}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    placeholder="Enter complete delivery address"
                    disabled={isSubmitting}
                  />
                  {errors.deliveryAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.deliveryAddress.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('contactPerson')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.contactPerson ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    placeholder="Enter contact person name"
                    disabled={isSubmitting}
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('contactPersonNumber')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.contactPersonNumber ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    disabled={isSubmitting}
                  />
                  {errors.contactPersonNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contactPersonNumber.message}
                    </p>
                  )}
                </div>

                <FormSelect
                  label="Delivery Method"
                  name="deliveryMethod"
                  register={register}
                  errors={errors}
                  options={deliveryMethodOptions}
                  placeholder="Select delivery method"
                  required
                  disabled={isSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    {...register('trackingNumber')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                    placeholder="Enter tracking number (if available)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    {...register('expectedDelivery')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                    //min={new Date().toISOString().split('T')[0]}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    {...register('remarks')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                    rows={3}
                    placeholder="Enter any additional remarks"
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {watch('remarks')?.length || 0}/500 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={isSubmitting || (quantity && selectedSerials.length !== parseInt(quantity))}
              >
                {isSubmitting && <LoadingSpinner />}
                <span>
                  {isSubmitting
                    ? (editData ? 'Updating...' : 'Processing...')
                    : (editData ? 'Update Outward' : 'Process Outward')
                  }
                </span>
              </button>
            </div>

            {/* Form Status */}
            {quantity && availableSerials.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <div className="flex-1">
                    <strong>Form Status:</strong>
                    <div className="mt-1">
                      • Quantity requested: {quantity}
                    </div>
                    <div>
                      • Serial numbers selected: {selectedSerials.length}
                    </div>
                    <div>
                      • Available stock: {availableSerials.length}
                    </div>
                  </div>
                  <div className="ml-4">
                    {selectedSerials.length === parseInt(quantity) ? (
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Ready to submit
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Incomplete selection
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default OutwardFormModal