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
const DirectMerchantCardRateItem = ({
  index,
  register,
  errors,
  onRemove,
  productName
}) => {

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">

      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs text-gray-500">
            Product Type
          </span>

          <p className="font-semibold text-blue-700">
            {productName || 'Unknown Product'}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Name <span className="text-red-500">*</span>
          </label>

          <input
            {...register(`cardRates.${index}.cardName`, {
              required: 'Card name is required'
            })}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />

          {errors.cardRates?.[index]?.cardName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.cardRates[index].cardName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>

          <input
            {...register(`cardRates.${index}.category`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate (%) <span className="text-red-500">*</span>
          </label>

          <input
            {...register(`cardRates.${index}.merchantRate`, {
              required: 'Merchant Rate is required',
              min: {
                value: 0,
                message: 'Rate must be positive'
              },
              max: {
                value: 100,
                message: 'Rate cannot exceed 100%'
              }
            })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2.5"
          />

          {errors.cardRates?.[index]?.merchantRate && (
    <p className="mt-1 text-sm text-red-500">
        {errors.cardRates[index].merchantRate.message}
    </p>
)}
        </div>

      </div>
    </div>
  )
}

// Card Rate Item Component for Franchises
const FranchiseCardRateItem = ({
  index,
  register,
  errors,
  onRemove,
  productName
}) => {

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">

      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs text-gray-500">
            Product Type
          </span>

          <p className="font-semibold text-blue-700">
            {productName || 'Unknown Product'}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Name <span className="text-red-500">*</span>
          </label>

          <input
            {...register(`cardRates.${index}.cardName`, {
              required: 'Card name is required'
            })}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />

          {errors.cardRates?.[index]?.cardName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.cardRates[index].cardName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>

          <input
            {...register(`cardRates.${index}.category`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise Rate (%) <span className="text-red-500">*</span>
          </label>

          <input
            {...register(`cardRates.${index}.franchiseRate`, {
              required: 'Franchise rate is required',
              min: {
                value: 0,
                message: 'Rate must be positive'
              },
              max: {
                value: 100,
                message: 'Rate cannot exceed 100%'
              }
            })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2.5"
          />

          {errors.cardRates?.[index]?.franchiseRate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.cardRates[index].franchiseRate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Merchant Rate (%) <span className="text-red-500">*</span>
          </label>

          <input
            {...register(`cardRates.${index}.merchantRate`, {
              required: 'Merchant rate is required',
              min: {
                value: 0,
                message: 'Rate must be positive'
              },
              max: {
                value: 100,
                message: 'Rate cannot exceed 100%'
              }
            })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3.0"
          />

          {errors.cardRates?.[index]?.merchantRate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.cardRates[index].merchantRate.message}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}


// Card Rates Component - pricing form 
const CardRates = ({
  control,
  register,
  errors,
  watch,
  categories,
  categoriesLoading
}) => {

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cardRates'
  })

  const [selectedProductCategoryId, setSelectedProductCategoryId] =
    useState('')

  const [selectedCardType, setSelectedCardType] =
    useState('')

  const [cardTypes, setCardTypes] =
    useState([])

  const [showAddModal, setShowAddModal] =
    useState(false)

  const [newCardTypeName, setNewCardTypeName] =
    useState('')

  const [cardTypesLoading, setCardTypesLoading] =
    useState(true)

  const customerType = watch('customerType')

  useEffect(() => {

    const loadCardTypes = async () => {

      try {

        const response =
          await api.get('/card-types')

        setCardTypes(response.data || [])

      } catch (error) {

        console.error(
          'Failed to load card types:',
          error
        )

      } finally {

        setCardTypesLoading(false)
      }
    }

    loadCardTypes()

  }, [])

  const getProductName = productCategoryId => {

    const product =
      categories.find(
        item =>
          String(item.value) ===
          String(productCategoryId)
      )

    return product?.label || 'Unknown Product'
  }

  const isDuplicateProductCard = (
    productCategoryId,
    cardName
  ) => {

    return fields.some(field => {

      const existingProductId =
        field.productCategory?.id ||
        field.productCategoryId

      return (
        String(existingProductId) ===
        String(productCategoryId) &&
        field.cardName
          ?.trim()
          .toLowerCase() ===
        cardName
          ?.trim()
          .toLowerCase()
      )
    })
  }

  const addDatabaseCardRate = () => {

    if (!selectedProductCategoryId) {
      alert('Please select a product type')
      return
    }

    if (!selectedCardType) {
      alert('Please select a card type')
      return
    }

    if (
      isDuplicateProductCard(
        selectedProductCategoryId,
        selectedCardType
      )
    ) {
      alert(
        'This card type is already added for the selected product'
      )
      return
    }

    const commonData = {
      productCategory: {
        id: Number(selectedProductCategoryId)
      },
      productCategoryName:
        getProductName(selectedProductCategoryId),
      cardName: selectedCardType,
      category: ''
    }

    if (customerType === 'franchise') {

      append({
        ...commonData,
        franchiseRate: '',
        merchantRate: ''
      })

    } else {

    append({
        ...commonData,
        merchantRate: '',
        franchiseRate: null
    })
}

    setSelectedCardType('')
  }

  const handleAddNewCardType = async () => {

    const normalizedCardName =
      newCardTypeName.trim()

    if (!normalizedCardName) {
      return
    }

    if (!selectedProductCategoryId) {
      alert(
        'Please select a product type before adding a new card type'
      )
      return
    }

    if (
      isDuplicateProductCard(
        selectedProductCategoryId,
        normalizedCardName
      )
    ) {
      alert(
        'This card type is already added for the selected product'
      )
      return
    }

    try {

      const response =
        await api.post('/card-types', {
          cardName: normalizedCardName
        })

      const updatedResponse =
        await api.get('/card-types')

      setCardTypes(updatedResponse.data || [])

      const commonData = {
        productCategory: {
          id: Number(selectedProductCategoryId)
        },
        productCategoryName:
          getProductName(selectedProductCategoryId),
        cardName: response.data.cardName,
        category: ''
      }

      if (customerType === 'franchise') {

        append({
          ...commonData,
          franchiseRate: '',
          merchantRate: ''
        })

     } else {

    append({
        ...commonData,
        merchantRate: '',
        franchiseRate: null
    })
}

      setNewCardTypeName('')
      setShowAddModal(false)

    } catch (error) {

      console.error(
        'Failed to create card type:',
        error
      )

      alert(
        error?.response?.data?.error ||
        'Failed to create card type. It may already exist.'
      )
    }
  }

  const groupedFields = fields.reduce(
    (groups, field, index) => {

      const productCategoryId =
        field.productCategory?.id ||
        field.productCategoryId ||
        'unknown'

      const productName =
        field.productCategoryName ||
        getProductName(productCategoryId)

      const groupKey =
        String(productCategoryId)

      if (!groups[groupKey]) {
        groups[groupKey] = {
          productCategoryId,
          productName,
          rows: []
        }
      }

      groups[groupKey].rows.push({
        field,
        index
      })

      return groups

    },
    {}
  )

  return (
    <div className="bg-gray-50 p-4 rounded-lg">

      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-700">
          Category Processing Rates
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Select a product and card type, then click Add Selected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Type <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedProductCategoryId}
            onChange={event =>
              setSelectedProductCategoryId(
                event.target.value
              )
            }
            disabled={categoriesLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {categoriesLoading
                ? 'Loading products...'
                : 'Select product type'}
            </option>

            {categories.map(product => (
              <option
                key={product.value}
                value={product.value}
              >
                {product.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Card Type <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedCardType}
            onChange={event =>
              setSelectedCardType(event.target.value)
            }
            disabled={cardTypesLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {cardTypesLoading
                ? 'Loading card types...'
                : 'Select card type'}
            </option>

            {cardTypes.map(cardType => (
              <option
                key={cardType.id}
                value={cardType.cardName}
              >
                {cardType.cardName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addDatabaseCardRate}
            disabled={
              !selectedProductCategoryId ||
              !selectedCardType ||
              cardTypesLoading
            }
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add Selected
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {

              if (!selectedProductCategoryId) {
                alert(
                  'Please select a product type first'
                )
                return
              }

              setShowAddModal(true)
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex justify-center items-center gap-2"
          >
            <Plus size={16} />
            Add New Type
          </button>
        </div>

      </div>

      <div className="space-y-5">

        {Object.values(groupedFields).map(group => (

          <div
            key={group.productCategoryId}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >

            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h4 className="font-semibold text-blue-800">
                {group.productName}
              </h4>

              <p className="text-xs text-blue-600">
                {group.rows.length} card type(s)
              </p>
            </div>

            <div className="p-3 space-y-3">
              {group.rows.map(({ field, index }) => (

                customerType === 'franchise' ? (

                  <FranchiseCardRateItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    productName={group.productName}
                    onRemove={() => remove(index)}
                  />

                ) : (

                  <DirectMerchantCardRateItem
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    productName={group.productName}
                    onRemove={() => remove(index)}
                  />
                )
              ))}
            </div>

          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">
              No card types added yet.
            </p>

            <p className="text-xs mt-1">
              Select a product and card type, then click Add Selected.
            </p>
          </div>
        )}

      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">

            <div className="p-6">

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                New Card Type
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Product: {
                  getProductName(
                    selectedProductCategoryId
                  )
                }
              </p>

              <input
                type="text"
                placeholder="Enter new card type"
                value={newCardTypeName}
                onChange={event =>
                  setNewCardTypeName(
                    event.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                autoFocus
                onKeyDown={event => {

                  if (event.key === 'Enter') {
                    handleAddNewCardType()
                  }

                  if (event.key === 'Escape') {
                    setShowAddModal(false)
                    setNewCardTypeName('')
                  }
                }}
              />

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewCardTypeName('')
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
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
  )
}


const PricingSchemeFormModal = ({
  onCancel,
  onSubmit,
  initialData = null,
  isEdit = false,
  isReuse = false
}) => {

  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true)

  const normalizeCardRates = (cardRates = []) => {

    return cardRates.map(rate => {

        const productCategoryId =
            rate.productCategoryId ||
            rate.productCategory?.id

        const productCategoryName =
            rate.productCategoryName ||
            rate.productCategory?.categoryName ||
            ''

        return {
            ...rate,

            productCategory: productCategoryId
                ? {
                    id: Number(productCategoryId)
                }
                : null,

            productCategoryName,

            merchantRate:
                rate.merchantRate ??
                rate.rate ??
                ''
        }
    })
}

  const getDefaultValues = () => ({
    schemeCode: '',
    rentalByMonth: '',
    customerType: '',
    cardRates: [],
    description: ''
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
    defaultValues:
      initialData && isEdit && !isReuse
        ? {
          ...initialData,
          cardRates: normalizeCardRates(
            initialData.cardRates || []
          )
        }
        : getDefaultValues()
  })

  // Fetch scheme code on mount for new schemes OR when reusing
  useEffect(() => {
    if (!isEdit && !initialData && !isReuse) {
    fetchNewSchemeCode()
}
    fetchCategory()
  }, [isEdit, initialData, isReuse])

  // Set form values when initialData changes (for reuse mode)
  useEffect(() => {

    if (!initialData || !isReuse) {
        return
    }

    const reusedCardRates =
        normalizeCardRates(initialData.cardRates || [])
            .map(rate => {

                const {
                    id,
                    pricingScheme,
                    ...rateWithoutId
                } = rate

                return rateWithoutId
            })

    reset({
        schemeCode: '',
        rentalByMonth: initialData.rentalByMonth ?? '',
        customerType: initialData.customerType ?? '',
        description: initialData.description ?? '',
        cardRates: reusedCardRates
    })

    fetchNewSchemeCode()

}, [initialData, isReuse, reset])

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

const onFormSubmit = data => {

  if (!data.cardRates || data.cardRates.length === 0) {
    alert(
      'Please add at least one product and card type'
    )
    return
  }

  const duplicateKeys = new Set()

  for (const rate of data.cardRates) {

    const productCategoryId =
      rate.productCategory?.id ||
      rate.productCategoryId

    if (!productCategoryId) {
      alert(
        `Product type is missing for card ${rate.cardName}`
      )
      return
    }

    const duplicateKey =
      `${productCategoryId}_${rate.cardName
        ?.trim()
        .toLowerCase()}`

    if (duplicateKeys.has(duplicateKey)) {
      alert(
        `Duplicate card ${rate.cardName} found for the same product`
      )
      return
    }

    duplicateKeys.add(duplicateKey)
  }

  const preparedCardRates =
    data.cardRates
      .filter(rate => {

        if (!rate.cardName?.trim()) {
          return false
        }

        if (data.customerType === 'franchise') {
          return (
            rate.franchiseRate !== '' &&
            rate.merchantRate !== ''
          )
        }

        return rate.merchantRate !== ''
      })
      .map(rate => {

        const productCategoryId =
          rate.productCategory?.id ||
          rate.productCategoryId

        const preparedRate = {
          productCategory: {
            id: Number(productCategoryId)
          },

          cardName:
            rate.cardName.trim(),

          category:
            rate.category?.trim() || null
        }

        if (data.customerType === 'franchise') {

    preparedRate.franchiseRate =
        Number(rate.franchiseRate)

    preparedRate.merchantRate =
        Number(rate.merchantRate)

} else {

    preparedRate.merchantRate =
        Number(rate.merchantRate)

    preparedRate.franchiseRate = null
}

        return preparedRate
      })

  if (preparedCardRates.length === 0) {
    alert(
      'Please enter valid rates for at least one card type'
    )
    return
  }

  const requestData = {
    schemeCode: data.schemeCode,
    rentalByMonth:
      Number(data.rentalByMonth),
    customerType:
      data.customerType,
    description:
      data.description?.trim() || null,
    cardRates:
      preparedCardRates
  }

  onSubmit(requestData)
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
              <CardRates
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                categories={category}
                categoriesLoading={loading}
              />)}

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