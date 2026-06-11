import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Settings, FileText, ToggleRight, ToggleLeft } from 'lucide-react';
import { z } from 'zod';
import axiosInstance from '../../constants/API/axiosInstance';
import api from '../../constants/API/axiosInstance';

// Category Select with Add New Option Component
const CategorySelectField = ({
  label,
  name,
  register,
  error,
  options,
  required = false,
  placeholder = "Select an option",
  watch,
  setValue
}) => {
  const selectedValue = watch(name);
  const showNewCategoryInput = selectedValue === 'new';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
        <select
          {...register(name)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="new" className="font-medium text-green-600">
            + Add New Category
          </option>
        </select>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        )}
      </div>

      {showNewCategoryInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Category Name *
          </label>
          <input
            {...register('newCategoryName')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter new category name"
          />
          {watch('newCategoryName') && (
            <p className="text-green-600 text-sm mt-1">
              New category "{watch('newCategoryName')}" will be created
            </p>
          )}
        </div>
      )}
    </div>
  );
};


// Validation Schema
const productSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  vendorId: z.coerce.number().min(1, 'Please select a vendor'),
  productCategoryId: z.union([
    z.coerce.number().min(1, 'Please select a category'),
    z.literal("new") // allow "new" string for add category
  ]),
  newCategoryName: z.string().optional(),
  model: z.string().min(2, 'Model is required').or(z.literal('')),
  brand: z.string().min(2, 'Brand is required').or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters').or(z.literal('')),
  warrantyPeriod: z.number().min(0, 'Warranty period must be 0 or more months'),
  warrantyType: z.enum(['manufacturer', 'vendor', 'none']),
  hsn: z.string().regex(/^[0-9]{4,8}$/, 'HSN must be 4-8 digits'),
  status: z.boolean(),
  minOrderQuantity: z.number().min(1, 'Minimum order quantity must be at least 1').or(z.literal('')),
  maxOrderQuantity: z.number().min(1, 'Maximum order quantity must be at least 1').or(z.literal('')),
  remarks: z.string().nullable().optional().default("")
}).refine((data) => data.maxOrderQuantity >= data.minOrderQuantity, {
  message: "Maximum quantity must be greater than or equal to minimum quantity",
  path: ["maxOrderQuantity"],
}).refine((data) => {
  if (data.productCategoryId === 'new' && (!data.newCategoryName || data.newCategoryName.trim().length < 2)) {
    return false;
  }
  return true;
}, {
  message: "New category name must be at least 2 characters",
  path: ["newCategoryName"],
});

// Form Header Component
const FormHeader = ({ isEdit, onCancel }) => (
  <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-6 rounded-t-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Package className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-green-100">
            {isEdit ? 'Update product information' : 'Register a new product in the catalog'}
          </p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
      >
        ✕
      </button>
    </div>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );
};

// Input Field Component
const InputField = ({
  label,
  name,
  register,
  error,
  required = false,
  type = "text",
  placeholder = "",
  disabled = false,
  ...props
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    <input
      {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
      type={type}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Select Field Component
const SelectField = ({
  label,
  name,
  register,
  error,
  options,
  required = false,
  placeholder = "Select an option"
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    <select
      {...register(name)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Textarea Field Component
const TextareaField = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder = "",
  rows = 3
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    <textarea
      {...register(name)}
      rows={rows}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      placeholder={placeholder}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Status Toggle Component
const StatusToggle = ({ status, onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Status
    </label>
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${status
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-red-100 text-red-700 border border-red-300'
          }`}
      >
        {status ? (
          <ToggleRight className="h-5 w-5" />
        ) : (
          <ToggleLeft className="h-5 w-5" />
        )}
        <span className="font-medium">
          {status ? 'Active' : 'Inactive'}
        </span>
      </button>
    </div>
  </div>
);

// Section Header Component
const SectionHeader = ({ icon, title }) => (
  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    {icon}
    {title}
  </h2>
);

// Main Form Component
const ProductMasterForm = ({ onSubmit, onCancel, initialData = null, isEdit = false }) => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      ...initialData,
      vendorId: initialData.vendor?.id || '',
      productCategoryId: initialData?.productCategory?.id || '',
      warrantyType: initialData?.warrantyType || 'manufacturer'
    } : {
      productName: '',
      vendorId: '',
      productCategoryId: '',
      newCategoryName: '',
      model: '',
      brand: '',
      description: '',
      warrantyPeriod: 12,
        warrantyType: 'manufacturer',
      hsn: '',
      status: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 100,
      remarks: ''
    }
  });

  const watchStatus = watch('status');

  // Load vendors and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);

        const [vendorsResponse, categoriesResponse] = await Promise.all([
          api.get('/vendors/id_name'),
          api.get('/product-categories')
        ]);

        setVendors(vendorsResponse.data.map(vendor => ({
          value: vendor.id,
          label: vendor.name
        })));

        setCategories(categoriesResponse.data.map(category => ({
          value: category.id,
          label: category.categoryName
        })));
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load vendors and categories. Please refresh the page.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);


  // Handle form submission
  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Determine category name - use newCategoryName if new category, otherwise find existing category name
      let categoryName, categoryId;
      if (data.productCategoryId === 'new') {
        categoryName = data.newCategoryName;
      } else {
        // Find the selected category name from categories array
        const selectedCategory = categories.find(cat => cat.value === data.productCategoryId);
        categoryName = selectedCategory ? selectedCategory.label : '';
        categoryId = selectedCategory ? Number(selectedCategory.value) : "";
      }

      // Transform data to match backend expectations
      const transformedData = {
        productName: data.productName,
        vendor: { id: Number(data.vendorId) },
        productCategory: { id: Number(categoryId),categoryName: categoryName },
        model: data.model,
        brand: data.brand,
        description: data.description,
        warrantyPeriod: data.warrantyPeriod,
        warrantyType: data.warrantyType,
        hsn: data.hsn,
        status: data.status,
        minOrderQuantity: data.minOrderQuantity,
        maxOrderQuantity: data.maxOrderQuantity,
        remarks: data.remarks || null
      };


      onSubmit(transformedData);

    } catch (error) {
      console.error('Error saving product:', error);

      if (error.response?.data) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else if (error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to save product. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = () => {
    setValue('status', !watchStatus);
  };

  const warrantyTypes = [
    { value: 'manufacturer', label: 'Manufacturer Warranty' },
    { value: 'vendor', label: 'Vendor Warranty' },
    { value: 'none', label: 'No Warranty' }
  ];

  if (dataLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg">
          <FormHeader isEdit={isEdit} onCancel={onCancel} />

          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
            <ErrorDisplay error={error} />

            {/* Basic Information */}
            <div>
              <SectionHeader
                icon={<Package className="h-5 w-5 mr-2 text-green-600" />}
                title="Basic Information"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Vendor"
                  name="vendorId"
                  register={register}
                  error={errors.vendorId}
                  options={vendors}
                  required
                  placeholder="Select Vendor"
                />

                <CategorySelectField
                  label="Category"
                  name="productCategoryId"
                  register={register}
                  error={errors.productCategoryId || errors.newCategoryName}
                  options={categories}
                  required
                  placeholder="Select Category"
                  watch={watch}
                  setValue={setValue}
                />

                <InputField
                  label="Product Name"
                  name="productName"
                  register={register}
                  error={errors.productName}
                  required
                  placeholder="Enter product name"
                />

                <InputField
                  label="Brand"
                  name="brand"
                  register={register}
                  error={errors.brand}
                  
                  placeholder="Enter brand name"
                />

                <InputField
                  label="Model"
                  name="model"
                  register={register}
                  error={errors.model}
                  
                  placeholder="Enter model number"
                />

                <div className="md:col-span-2">
                  <TextareaField
                    label="Description"
                    name="description"
                    register={register}
                    error={errors.description}
                    
                    placeholder="Enter detailed product description"
                  />
                </div>

                <StatusToggle
                  status={watchStatus}
                  onToggle={toggleStatus}
                />
              </div>
            </div>

            {/* Warranty & Legal */}
            <div>
              <SectionHeader
                icon={<FileText className="h-5 w-5 mr-2 text-green-600" />}
                title="Warranty & Legal Information"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Warranty Period (Months)"
                  name="warrantyPeriod"
                  register={register}
                  error={errors.warrantyPeriod}
                  type="number"
                  min="0"
                  required
                  placeholder="12"
                />

                <SelectField
                  label="Warranty Type"
                  name="warrantyType"
                  register={register}
                  error={errors.warrantyType}
                  options={warrantyTypes}
                  required
                />

                <InputField
                  label="HSN Code"
                  name="hsn"
                  register={register}
                  error={errors.hsn}
                  required
                  placeholder="Enter HSN code"
                  maxLength={8}
                />
              </div>
            </div>

            {/* Order Quantities */}
            <div>
              <SectionHeader title="Order Quantities" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Minimum Order Quantity"
                  name="minOrderQuantity"
                  register={register}
                  error={errors.minOrderQuantity}
                  type="number"
                  min="1"
                  
                  placeholder="1"
                />

                <InputField
                  label="Maximum Order Quantity"
                  name="maxOrderQuantity"
                  register={register}
                  error={errors.maxOrderQuantity}
                  type="number"
                  min="1"
                  
                  placeholder="100"
                />
              </div>
            </div>

            {/* Remarks */}
            <TextareaField
              label="Remarks"
              name="remarks"
              register={register}
              error={errors.remarks}
              placeholder="Enter any additional remarks or notes"
            />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductMasterForm;