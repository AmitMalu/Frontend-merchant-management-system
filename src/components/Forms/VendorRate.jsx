import { useState,useEffect,useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X,Plus, Wallet, Wallet2, CreditCard } from 'lucide-react'
import api from '../../constants/API/axiosInstance'

// ==================== FORM COMPONENTS ====================

// Reusable Input Component
const Input = ({ label, name, register, errors, required = false, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...register(name, {
        required: required ? `${label} is required` : false,
        ...(type === 'email' && { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } })
      })}
      type={type}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      {...props}
    />
    {errors[name] && (
      <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
    )}
  </div>
)

// Reusable Select Component (fixed to support register + custom onChange)
const Select = ({ label, name, register, errors, options, required = false, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, { required: required ? `${label} is required` : false })}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[name] ? "border-red-500" : "border-gray-300"
        }`}
      onChange={(e) => {
        // React Hook Form register will still work
        register(name).onChange(e)
        // Call parent custom handler (like fetchProducts)
        if (onChange) {
          const selectedOption = options.find(opt => opt.value === e.target.value)
          onChange(selectedOption || null)
        }
      }}
      {...props}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {errors[name] && (
      <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
    )}
  </div>
)

// Monthly Rent Component
const MonthlyRent = ({ register, errors }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Rent</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Monthly Rent (₹)"
          name="monthlyRent"
          register={register}
          errors={errors}
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Enter monthly rent"
        />
      </div>
    </div>
  )
}

// Card Rate Item Component
const CardRateItem = ({ index, register, errors, onRemove }) => {
  return (
    <div className="flex items-end gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Type <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`vendorCardRates.${index}.cardType`, { required: 'Card type is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter card type"
        />
        {errors.vendorCardRates?.[index]?.cardType && (
          <p className="mt-1 text-sm text-red-500">{errors.vendorCardRates[index].cardType.message}</p>
        )}
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate (%) <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`vendorCardRates.${index}.rate`, {
            required: 'Rate is required',
            min: { value: 0, message: 'Rate must be positive' },
            max: { value: 100, message: 'Rate cannot exceed 100%' }
          })}
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 2.5"
        />
        {errors.vendorCardRates?.[index]?.rate && (
          <p className="mt-1 text-sm text-red-500">{errors.vendorCardRates[index].rate.message}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        title="Remove card type"
      >
        <X size={20} />
      </button>
    </div>
  )
}


// Card Rates Component in vendor - rates  
const CardRates = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vendorCardRates"
  });

  const [selectedCardType, setSelectedCardType] = useState('');
  const [cardTypes, setCardTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardTypeName, setNewCardTypeName] = useState('');
  const [loading, setLoading] = useState(true);

  // Load card types from database
  useEffect(() => {
    const loadCardTypes = async () => {
      try {
        const response = await api.get('/card-types');
        setCardTypes(response.data);
      } catch (error) {
        console.error('Failed to load card types:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCardTypes();
  }, []);

  const addDatabaseCardRate = () => {
    if (selectedCardType) {
      append({ cardType: selectedCardType, rate: '' });
      setSelectedCardType('');
    }
  };


  const handleAddNewCardType = async () => {
    if (!newCardTypeName.trim()) return;

    try {
      const response = await api.post('/card-types', {
        cardName: newCardTypeName.trim()
      });

      // Refresh card types list
      const updatedResponse = await api.get('/card-types');
      setCardTypes(updatedResponse.data);

      // Add the new card type to form and select it
      append({ cardType: response.data.cardName, rate: '' });

      // Reset modal
      setNewCardTypeName('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create card type:', error);
      alert('Failed to create card type. It might already exist.');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Card Processing Rates</h3>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={selectedCardType}
              onChange={(e) => setSelectedCardType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">
                {loading ? 'Loading...' : 'Select card type'}
              </option>
              {cardTypes.map(cardType => (
                <option key={cardType.id} value={cardType.cardName}>
                  {cardType.cardName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addDatabaseCardRate}
              disabled={!selectedCardType || loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add Selected
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Type
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <CardRateItem
            key={field.id}
            index={index}
            register={register}
            errors={errors}
            onRemove={() => remove(index)}
          />
        ))}
        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No card types added yet.</p>
            <p className="text-xs mt-1">Use the buttons above to add card types from database or create custom ones.</p>
          </div>
        )}
      </div>

      {/* Add New Card Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">New Card Type</h3>
              <input
                type="text"
                placeholder="Enter new card type"
                value={newCardTypeName}
                onChange={(e) => setNewCardTypeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewCardType();
                  if (e.key === 'Escape') {
                    setShowAddModal(false);
                    setNewCardTypeName('');
                  }
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCardTypeName('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewCardType}
                  disabled={!newCardTypeName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Enhanced Vendor Product Details Component
const VendorProductDetails = ({ register, errors, editData, control, setValue, watch, isReuse }) => {
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Watch vendor changes from the form
  const watchedVendor = watch('vendor')

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    if (editData?.productId && products.length > 0 && isInitialized && !isReuse) {
      const productExists = products.find(product =>
        product.id === editData.productId || product.value === editData.productId.toString()
      )
      if (productExists) {
        setValue('productId', editData.productId.toString())
      }
    }
  }, [products, editData?.productId, isInitialized, isReuse, setValue])

  // Handle initial data population when vendors are loaded and we have edit data
  useEffect(() => {
    if (editData && vendors.length > 0 && !isInitialized && !isReuse) {
      // Find and set the initial vendor (only for edit mode, not reuse)
      if (editData.vendorId) {
        const initialVendor = vendors.find(vendor =>
          vendor.id === editData.vendorId || vendor.value === editData.vendorId.toString()
        )
        if (initialVendor) {
          setSelectedVendor(initialVendor)
          // Set the vendor value in the form
          setValue('vendor', initialVendor.value)
          // Fetch products for this vendor and set the initial product
          fetchProductsByVendor(initialVendor.id, editData.productId)
        }
      }
      setIsInitialized(true)
    } else if (isReuse && vendors.length > 0 && !isInitialized) {
      // For reuse mode, just mark as initialized without setting vendor/product
      setIsInitialized(true)
    }
  }, [editData, vendors, isInitialized, isReuse, setValue])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vendors/id_name')
      const vendorOptions = response.data.map(vendor => ({
        value: vendor.id.toString(),
        label: vendor.name,
        id: vendor.id
      }))
      setVendors(vendorOptions)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsByVendor = async (vendorId, preselectedProductId = null) => {
    try {
      setProductsLoading(true)
      const response = await api.get(`/products/vendor/${vendorId}`)
      const productOptions = response.data.map(product => ({
        value: product.id.toString(),
        label: `${product.productCode} - ${product.productName}`,
        id: product.id
      }))
      setProducts(productOptions)

      // If we have a preselected product ID (for edit mode), set it in the form
      if (preselectedProductId) {
        setValue('productId', preselectedProductId.toString())
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const handleVendorChange = (vendor) => {
    setSelectedVendor(vendor)
    setProducts([]) // Clear products when vendor changes
    setValue('productId', '') // Clear selected product

    if (vendor && vendor.id) {
      fetchProductsByVendor(vendor.id)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Vendor & Product Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Vendor"
          name="vendor"
          register={register}
          errors={errors}
          options={vendors}
          placeholder={loading ? "Loading vendors..." : "Search and select vendor"}
          onChange={handleVendorChange}
          disabled={loading}
          required
        />

        <Select
          label="Product Code"
          name="productId"
          register={register}
          errors={errors}
          options={products}
          placeholder={
            !selectedVendor
              ? "Select vendor first"
              : productsLoading
                ? "Loading products..."
                : "Search and select product"
          }
          disabled={!selectedVendor || productsLoading}
          required
        />

        <Input
          label="Effective Date"
          name="effectiveDate"
          register={register}
          errors={errors}
          type="date"
          required
        />

        <Input
          label="Expiry Date"
          name="expiryDate"
          register={register}
          errors={errors}
          type="date"
          required
        />
      </div>
    </div>
  )
}


// ==================== VENDOR RATE FORM MODAL ====================
const VendorRateForm = ({ onCancel, onSubmit, initialData = null, isEdit = false, isReuse = false }) => {
  const getDefaultValues = () => ({
    vendor: '',
    productId: '',
    effectiveDate: '',
    expiryDate: '',
    monthlyRent: '',
    vendorCardRates: [],
    remark: ''
  })

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialData && isEdit && !isReuse
      ? {
        ...initialData,
        vendor: String(initialData.vendorId),
        productId: String(initialData.productId)
      }
      : getDefaultValues()
  })

  // Set form values when initialData changes (for edit mode or reuse mode)
  useEffect(() => {
    if (initialData && (isEdit || isReuse)) {
      if (isReuse) {
        // For reuse mode, copy only monthlyRent, remark, and card rates without IDs
        setValue('monthlyRent', initialData.monthlyRent)
        setValue('remark', initialData.remark)

        // Copy card rates but remove their IDs
        const cardRatesWithoutIds = initialData.vendorCardRates.map(rate => {
          const { id, ...rateWithoutId } = rate
          return rateWithoutId
        })
        setValue('vendorCardRates', cardRatesWithoutIds)

        // Ensure these are empty
        setValue('vendor', '')
        setValue('productId', '')
        setValue('effectiveDate', '')
        setValue('expiryDate', '')
      } else {
        // For edit mode, set all values including vendor and product
        Object.keys(initialData).forEach(key => {
          if (key === 'vendorId') {
            setValue('vendor', String(initialData[key]))
          } else if (key === 'productId') {
            setValue('productId', String(initialData[key]))
          } else if (key !== 'id') {
            setValue(key, initialData[key])
          }
        })
      }
    }
  }, [initialData, isEdit, isReuse, setValue])

  const onFormSubmit = (data) => {
    console.log(data)

    // Filter card rates based on customer type
    const filteredCardRates = data.vendorCardRates.filter(rate =>
      rate.rate && parseFloat(rate.rate) > 0 && rate.cardType.trim()
    )

    // Remove IDs from card rates if reusing
    const processedCardRates = isReuse
      ? filteredCardRates.map(rate => {
        const { id, ...rateWithoutId } = rate
        return rateWithoutId
      })
      : filteredCardRates

    const filteredData = {
      ...data,
      vendor: { id: Number(data.vendor) },
      product: { id: Number(data.productId) },
      vendorCardRates: processedCardRates
    }

    // Remove ID if reusing (so backend treats it as new creation)
    if (isReuse) {
      const { id, ...dataWithoutId } = filteredData
      onSubmit(dataWithoutId)
    } else {
      onSubmit(filteredData)
    }

    onCancel()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-600 to-gray-800 rounded-t-lg">
          <h2 className="flex items-center text-2xl font-bold text-white">
            <CreditCard className='mr-2' size={40} />
            {isEdit && !isReuse ? 'Edit Vendor Rates' : isReuse ? 'Reuse Vendor Rates' : 'Add New Vendor Rates'}
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Close"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Reuse Notice */}
            {isReuse && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You're creating a new vendor rate based on an existing one.
                  The monthly rent and card rates have been pre-filled. Please select a vendor, product,
                  and set new effective and expiry dates.
                </p>
              </div>
            )}

            <VendorProductDetails
              register={register}
              errors={errors}
              editData={
                isReuse
                  ? {
                    vendorId: null,
                    productId: null,
                    effectiveDate: '',
                    expiryDate: ''
                  }
                  : {
                    vendorId: initialData?.vendorId,
                    productId: initialData?.productId,
                    effectiveDate: initialData?.effectiveDate,
                    expiryDate: initialData?.expiryDate
                  }
              }
              control={control}
              setValue={setValue}
              watch={watch}
              isReuse={isReuse}
            />
            <MonthlyRent register={register} errors={errors} />
            <CardRates control={control} register={register} errors={errors} />

            {/* Remarks */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  {...register('remark')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any additional remarks about the vendor rates"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onFormSubmit)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {isEdit && !isReuse ? 'Update Vendor Rates' : 'Save Vendor Rates'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorRateForm