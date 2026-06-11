import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Plus } from 'lucide-react'
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

// Reusable Select Component
const Select = ({ label, name, register, errors, options, required = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, { required: required ? `${label} is required` : false })}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
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

// Card Rate Item Component for Direct Merchants
const DirectMerchantCardRateItem = ({ index, register, errors, onRemove }) => {
  return (
    <div className="flex items-end gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`cardRates.${index}.cardName`, { required: 'Card name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter card name"
        />
        {errors.cardRates?.[index]?.cardName && (
          <p className="mt-1 text-sm text-red-500">{errors.cardRates[index].cardName.message}</p>
        )}
      </div>

      {/* NEW CATEGORY FIELD (Optional) */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          {...register(`cardRates.${index}.category`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter category (optional)"
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate (%) <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`cardRates.${index}.rate`, {
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
        {errors.cardRates?.[index]?.rate && (
          <p className="mt-1 text-sm text-red-500">{errors.cardRates[index].rate.message}</p>
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

// Card Rate Item Component for Franchises
const FranchiseCardRateItem = ({ index, register, errors, onRemove }) => {
  return (
    <div className="flex items-end gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`cardRates.${index}.cardName`, { required: 'Card name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter card name"
        />
        {errors.cardRates?.[index]?.cardName && (
          <p className="mt-1 text-sm text-red-500">{errors.cardRates[index].cardName.message}</p>
        )}
      </div>

      {/* NEW CATEGORY FIELD (Optional) */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          {...register(`cardRates.${index}.category`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter category (optional)"
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Franchise Rate (%) <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`cardRates.${index}.franchiseRate`, {
            required: 'Franchise rate is required',
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
        {errors.cardRates?.[index]?.franchiseRate && (
          <p className="mt-1 text-sm text-red-500">{errors.cardRates[index].franchiseRate.message}</p>
        )}
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Merchant Rate (%) <span className="text-red-500">*</span>
        </label>
        <input
          {...register(`cardRates.${index}.merchantRate`, {
            required: 'Merchant rate is required',
            min: { value: 0, message: 'Rate must be positive' },
            max: { value: 100, message: 'Rate cannot exceed 100%' }
          })}
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 3.0"
        />
        {errors.cardRates?.[index]?.merchantRate && (
          <p className="mt-1 text-sm text-red-500">{errors.cardRates[index].merchantRate.message}</p>
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


// Card Rates Component - pricing form 
const CardRates = ({ control, register, errors, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cardRates"
  });

  const [selectedCardType, setSelectedCardType] = useState('');
  const [cardTypes, setCardTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardTypeName, setNewCardTypeName] = useState('');
  const [loading, setLoading] = useState(true);
  const customerType = watch('customerType');

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
      if (customerType === 'franchise') {
        append({ cardName: selectedCardType, category: '', franchiseRate: '', merchantRate: '' });
      } else {
        append({ cardName: selectedCardType, category: '', rate: '' });
      }
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

      // Add the new card type to form
      if (customerType === 'franchise') {
        append({ cardName: response.data.cardName, franchiseRate: '', merchantRate: '' });
      } else {
        append({ cardName: response.data.cardName, rate: '' });
      }

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
        <h3 className="text-lg font-semibold text-gray-700">Category Processing Rates</h3>
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
          customerType === 'franchise' ? (
            <FranchiseCardRateItem
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => remove(index)}
            />
          ) : (
            <DirectMerchantCardRateItem
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => remove(index)}
            />
          )
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


const PricingSchemeFormModal = ({
  onCancel,
  onSubmit,
  initialData = null,
  isEdit = false,
  isReuse = false
}) => {

  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true)

  const getDefaultValues = () => ({
    schemeCode: '',
    rentalByMonth: '',
    customerType: '',
    cardRates: [],
    description: '',
    productCategoryName: '',
    productCategoryId: ''
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm({
    defaultValues: initialData && isEdit && !isReuse
      ? { ...initialData, productCategoryId: String(initialData.productCategoryId) }
      : getDefaultValues()
  })

  // Fetch scheme code on mount for new schemes OR when reusing
  useEffect(() => {
    if ((!isEdit && !initialData) || isReuse) {
      fetchNewSchemeCode()
    }
    fetchCategory()
  }, [isEdit, initialData, isReuse])

  // Set form values when initialData changes (for reuse mode)
  useEffect(() => {
    if (initialData && isReuse) {
      // For reuse mode, copy data but exclude IDs
      setValue('rentalByMonth', initialData.rentalByMonth)
      setValue('customerType', initialData.customerType)
      setValue('description', initialData.description)
      setValue('productCategoryId', String(initialData.productCategoryId))

      // Copy card rates but remove their IDs
      const cardRatesWithoutIds = initialData.cardRates.map(rate => {
        const { id, ...rateWithoutId } = rate
        return rateWithoutId
      })
      setValue('cardRates', cardRatesWithoutIds)
    }
  }, [initialData, isReuse, setValue])

  const fetchNewSchemeCode = async () => {
    try {
      const response = await api.get('/pricing-schemes/generate-code')

      if (response.status === 200) {
        setValue('schemeCode', response?.data?.schemeCode)
      }
    } catch (error) {
      console.error('Error fetching scheme code:', error)
    }
  }

  const fetchCategory = async () => {
    try {
      const response = await api.get("/product-categories")
      setCategory(response.data.map(category => ({
        value: String(category.id),
        label: category.categoryName
      })));

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const customerTypeOptions = [
    { value: 'franchise', label: 'Franchise' },
    { value: 'direct_merchant', label: 'Direct Merchant' }
  ]

  const onFormSubmit = (data) => {
    const filteredData = {
      ...data,
      productCategory: { id: Number(data.productCategoryId) },
      cardRates: data.cardRates.filter(rate => {
        if (data.customerType === 'franchise') {
          return (
            rate.franchiseRate && parseFloat(rate.franchiseRate) > 0 &&
            rate.merchantRate && parseFloat(rate.merchantRate) > 0 &&
            rate.cardName.trim()
          )
        } else {
          return rate.rate && parseFloat(rate.rate) > 0 && rate.cardName.trim()
        }
      }).map(rate => {
        // Remove IDs from card rates for reuse
        if (isReuse) {
          const { id, ...rateWithoutId } = rate
          return rateWithoutId
        }
        return rate
      })
    }

    // Remove scheme ID for reuse
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
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit && !isReuse ? 'Edit Pricing Scheme' : isReuse ? 'Reuse Pricing Scheme' : 'Add New Pricing Scheme'}
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
          {/* Reuse Notice */}
          {isReuse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You're creating a new pricing scheme based on an existing one.
                A new scheme code has been generated. Card rates and other details have been pre-filled.
              </p>
            </div>
          )}
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Scheme Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={<>
                    Scheme Code will be <span className='!text-yellow-700'>auto generated  </span> in this format
                    <span className='!text-red-700'> (might change)</span>

                  </>}
                  name="schemeCode"
                  register={register}
                  errors={errors}
                  required
                  disabled
                  readOnly
                  placeholder="Auto-generated"

                />
                {loading ? (
                  <div className="flex items-center">Loading categories...</div>
                ) : (
                  <Select
                    label="Product Type"
                    name="productCategoryId"
                    register={register}
                    errors={errors}
                    options={category}
                    required
                  />
                )}
                <Input
                  label="Rental by Month (₹)"
                  name="rentalByMonth"
                  register={register}
                  errors={errors}
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Enter monthly rental"
                />
                <Select
                  label="Customer Type"
                  name="customerType"
                  register={register}
                  errors={errors}
                  options={customerTypeOptions}
                  required
                />
              </div>
            </div>

            {/* Card Rates */}
            {watch('customerType') && (
              <CardRates control={control} register={register} errors={errors} watch={watch} />
            )}

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description for this pricing scheme"
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
                {isEdit && !isReuse ? 'Update Scheme' : 'Save Scheme'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingSchemeFormModal