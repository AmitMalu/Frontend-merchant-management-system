import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, X, Loader2, ChevronDown } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import returnTransactionAPI from '../../constants/API/returnTransactionApi';

// Updated Zod validation schema
const returnSchema = z.object({
  returnNumber: z.string().min(1, "Return number is required"),
  originalDeliveryNumber: z.string().min(1, "Original delivery number is required"),
  customerId: z.string().min(1, "Customer is required"),
  customerType: z.string().min(1, "Customer type is required"),
  customerName: z.string().min(1, "Customer name is required"),
  returnDate: z.string().min(1, "Return date is required"),
  receivedBy: z.string().min(1, "Receiver name is required"),
  productCategoryId: z.string().min(1, "Product category is required"),
  productId: z.string().min(1, "Product is required"),
  productName: z.string().min(1, "Product name is required"),
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().min(1, "Original quantity must be at least 1"),
  returnedQuantity: z.number().min(1, "Returned quantity must be at least 1"),
  returnReason: z.string().min(1, "Return reason is required"),
  returnCondition: z.string().min(1, "Return condition is required"),
  actionTaken: z.string().min(1, "Action taken is required"),
  refundAmount: z.number().min(0, "Refund amount must be positive").optional(),
  approvedBy: z.string().optional(),
  isWarranty: z.boolean().optional(),
  replacementRequired: z.boolean().optional(),
  inspectionNotes: z.string().optional(),
  remarks: z.string().optional(),
}).refine((data) => data.returnedQuantity <= data.quantity, {
  message: "Returned quantity cannot exceed original quantity",
  path: ["returnedQuantity"],
});

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
);

// Loading Spinner Component
const LoadingSpinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }
  return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
}

// Reusable Input Component
const FormInput = ({ label, name, register, errors, required = false, type = "text", disabled = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      {...register(name, {
        valueAsNumber: type === 'number' ? true : false,
        required: required && `${label} is required`
      })}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        errors[name] ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    />
    {errors[name] && (
      <div className="flex items-center mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {errors[name].message}
      </div>
    )}
  </div>
);

// Reusable Select Component
const FormSelect = ({ 
  label, 
  name, 
  register, 
  errors, 
  required = false, 
  options, 
  loading = false,
  placeholder,
  disabled = false,
  onChange,
  ...props 
}) => {
  const { onChange: registerOnChange, ...registerRest } = register(name);

  const handleChange = (e) => {
    registerOnChange(e);
    if (onChange) {
      onChange(e);
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
          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors ${
            errors[name] ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
          disabled={loading || disabled}
          {...props}
        >
          <option value="">
            {loading ? `Loading ${label.toLowerCase()}...` : placeholder || `Select ${label.toLowerCase()}`}
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
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[name].message}
        </div>
      )}
    </div>
  );
};

// Reusable Textarea Component
const FormTextarea = ({ label, name, register, errors, required = false, disabled = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      {...register(name, { required: required && `${label} is required` })}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        errors[name] ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    />
    {errors[name] && (
      <div className="flex items-center mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {errors[name].message}
      </div>
    )}
  </div>
);

// Serial Number Grid Component
const SerialNumberGrid = ({ availableSerials = [], returnedQuantity, onSelectionChange, loading = false }) => {
  const [selectedSerials, setSelectedSerials] = useState(new Set());

  const maxQuantity = parseInt(returnedQuantity) || 0;

  // Reset when product changes
  useEffect(() => {
    setSelectedSerials(new Set());
  }, [availableSerials]);

  // Clamp when quantity reduces
  useEffect(() => {
    if (selectedSerials.size > maxQuantity) {
      const trimmed = new Set(Array.from(selectedSerials).slice(0, maxQuantity));
      setSelectedSerials(trimmed);
    }
  }, [maxQuantity, selectedSerials]);

  // Notify parent
  useEffect(() => {
    const selectedItems = availableSerials.filter(serial => selectedSerials.has(serial.id));
    onSelectionChange?.(selectedItems);
  }, [selectedSerials, availableSerials, onSelectionChange]);

  const toggleSelection = useCallback(
    (serialId) => {
      setSelectedSerials(prev => {
        const next = new Set(prev);
        if (next.has(serialId)) {
          next.delete(serialId);
        } else if (next.size < maxQuantity) {
          next.add(serialId);
        }
        return next;
      });
    },
    [maxQuantity]
  );

  const handleSelectAll = () => {
    const toSelect = availableSerials.slice(0, maxQuantity).map(s => s.id);
    setSelectedSerials(new Set(toSelect));
  };

  const handleDeselectAll = () => {
    setSelectedSerials(new Set());
  };

  if (loading) {
    return (
      <div className="mt-4 p-8 bg-gray-50 rounded-lg flex items-center justify-center">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-gray-600">Loading serial numbers...</span>
      </div>
    );
  }

  if (availableSerials.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Select a delivery number to view available serial numbers for return</p>
      </div>
    );
  }

  const selectedCount = selectedSerials.size;

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
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
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
                const isSelected = selectedSerials.has(serial.id);
                const isDisabled = !isSelected && selectedSerials.size >= maxQuantity;

                return (
                  <tr
                    key={serial.id}
                    className={`${isSelected ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => toggleSelection(serial.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{index + 1}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.mid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.sid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.tid || "-"}</td>
                    <td className="px-3 py-3 text-sm font-mono">{serial.vpaid || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 text-sm bg-red-50 p-3 rounded">
        <strong>Summary:</strong> {selectedCount} out of {maxQuantity} required items selected for return
        {selectedCount > 0 && selectedCount === maxQuantity && (
          <div className="text-green-700 font-medium mt-1">✓ Ready for return processing</div>
        )}
        {selectedCount !== maxQuantity && maxQuantity > 0 && (
          <div className="text-amber-700 mt-1">⚠ Please select exactly {maxQuantity} items to return</div>
        )}
      </div>
    </div>
  );
};

const OptimizedReturns = ({ onSubmit, onCancel, editData = null, showToast }) => {
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [outwardTransactions, setOutwardTransactions] = useState([]);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedDeliveryTransaction, setSelectedDeliveryTransaction] = useState(null);

  // Loading states  
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [outwardTransactionsLoading, setOutwardTransactionsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      returnedQuantity: 0,
      refundAmount: 0,
      isWarranty: false,
      replacementRequired: false,
    }
  });

  // Watch values for dependencies
  const selectedCategoryId = watch('productCategoryId');
  const selectedProductId = watch('productId');
  const selectedCustomerType = watch('customerType');
  const selectedCustomerId = watch('customerId');
  const returnedQuantity = watch('returnedQuantity');
  const selectedDeliveryNumber = watch('originalDeliveryNumber');

  // API Functions with proper error handling
  const fetchCategories = useCallback(async () => {
    if (categoriesLoading) return; // Prevent multiple simultaneous calls
    
    setCategoriesLoading(true);
    try {
      const response = await api.get('/product-categories');
      if (response.data && Array.isArray(response.data)) {
        const categoryOptions = response.data.map(category => ({
          value: category.id.toString(),
          label: category.categoryName || category.name || 'Unnamed Category'
        }));
        setCategories(categoryOptions);
      } else {
        throw new Error('Invalid response format for categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      const errorMsg = `Failed to load categories: ${error.response?.data?.message || error.message}`;
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [categoriesLoading, showToast]);

  const fetchProductsByCategory = useCallback(async (categoryId) => {
    if (!categoryId || productsLoading) return;

    setProductsLoading(true);
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      if (response.data && Array.isArray(response.data)) {
        const productOptions = response.data.map(product => ({
          value: product.id.toString(),
          label: `${product.productCode || 'N/A'} - ${product.productName || product.name || 'Unnamed Product'}`,
          productCode: product.productCode,
          productName: product.productName || product.name,
          productType: product.productType || 'Unknown'
        }));
        setProducts(productOptions);
      } else {
        throw new Error('Invalid response format for products');
      }
      setValue('productId', '');
      setValue('productName', '');
      setValue('productType', '');
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMsg = `Failed to load products: ${error.response?.data?.message || error.message}`;
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [productsLoading, setValue, showToast]);

  const fetchCustomers = useCallback(async (customerType) => {
    if (!customerType || customersLoading) return;

    setCustomersLoading(true);
    try {
      const endpoint = customerType === 'franchise' ? '/franchise' : '/merchants/direct-merchant';
      const response = await api.get(endpoint);

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
        }));
        setCustomers(customerOptions);
      } else {
        throw new Error('Invalid response format for customers');
      }
      setValue('customerId', '');
      setValue('customerName', '');
    } catch (error) {
      console.error(`Error fetching ${customerType}s:`, error);
      const errorMsg = `Failed to load ${customerType}s: ${error.response?.data?.message || error.message}`;
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, [customersLoading, setValue, showToast]);

  const fetchOutwardTransactions = useCallback(async (productId, customerId, customerType) => {
    if (!productId || !customerId || !customerType || outwardTransactionsLoading) return;

    setOutwardTransactionsLoading(true);
    try {
      const response = await api.get('/outward-transactions');
      if (response.data && Array.isArray(response.data)) {
        const filteredTransactions = response.data.filter(transaction => {
          const productMatch = transaction.productId === parseInt(productId);
          let customerMatch = false;
          
          if (customerType === 'franchise') {
            customerMatch = transaction.franchiseId === parseInt(customerId);
          } else {
            customerMatch = transaction.merchantId === parseInt(customerId);
          }
          
          return productMatch && customerMatch && transaction.serialNumbers && transaction.serialNumbers.length > 0;
        });

        setOutwardTransactions(filteredTransactions);
      } else {
        throw new Error('Invalid response format for outward transactions');
      }
    } catch (error) {
      console.error('Error fetching outward transactions:', error);
      const errorMsg = `Failed to load delivery records: ${error.response?.data?.message || error.message}`;
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      setOutwardTransactions([]);
    } finally {
      setOutwardTransactionsLoading(false);
    }
  }, [outwardTransactionsLoading, showToast]);

  // Effects with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const loadCategories = async () => {
      if (isMounted) {
        await fetchCategories();
      }
    };
    
    loadCategories();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  useEffect(() => {
    let isMounted = true;
    
    if (selectedCategoryId && isMounted) {
      fetchProductsByCategory(selectedCategoryId);
    } else {
      setProducts([]);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId]);

  useEffect(() => {
    let isMounted = true;
    
    if (selectedCustomerType && isMounted) {
      fetchCustomers(selectedCustomerType);
    } else {
      setCustomers([]);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedCustomerType]);

  useEffect(() => {
    let isMounted = true;
    
    if (selectedProductId && selectedCustomerId && selectedCustomerType && isMounted) {
      fetchOutwardTransactions(selectedProductId, selectedCustomerId, selectedCustomerType);
    } else {
      setOutwardTransactions([]);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedProductId, selectedCustomerId, selectedCustomerType]);

  // Auto-fill product details
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const selectedProduct = products.find(p => p.value === selectedProductId);
      if (selectedProduct) {
        setValue('productName', selectedProduct.productName);
        setValue('productType', selectedProduct.productType);
      }
    }
  }, [selectedProductId, products, setValue]);

  // Auto-fill customer name
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const selectedCustomer = customers.find(c => c.value === selectedCustomerId);
      if (selectedCustomer) {
        setValue('customerName', selectedCustomer.label);
      }
    }
  }, [selectedCustomerId, customers, setValue]);

  // Handle delivery selection
  useEffect(() => {
    if (selectedDeliveryNumber && outwardTransactions.length > 0) {
      const selectedTransaction = outwardTransactions.find(t => t.deliveryNumber === selectedDeliveryNumber);
      if (selectedTransaction) {
        setSelectedDeliveryTransaction(selectedTransaction);
        setValue('quantity', selectedTransaction.quantity);
        setAvailableSerials(selectedTransaction.serialNumbers || []);
      } else {
        setSelectedDeliveryTransaction(null);
        setAvailableSerials([]);
      }
    } else {
      setSelectedDeliveryTransaction(null);
      setAvailableSerials([]);
    }
  }, [selectedDeliveryNumber, outwardTransactions, setValue]);

  // Load edit data
  useEffect(() => {
    if (editData) {
      Object.keys(editData).forEach(key => {
        if (!['selectedSerials', 'productSerialNumbers'].includes(key)) {
          if (editData[key] !== null && editData[key] !== undefined) {
            setValue(key, editData[key]);
          }
        }
      });

      if (editData.productSerialNumbers && Array.isArray(editData.productSerialNumbers)) {
        setSelectedSerialNumbers(editData.productSerialNumbers);
      }
    }
  }, [editData, setValue]);

  // Form options
  const customerTypeOptions = [
    { value: 'franchise', label: 'Franchise' },
    { value: 'merchant', label: 'Direct Merchant' }
  ];

  const productTypes = [
    { value: 'pos_machine', label: 'POS Machine' },
    { value: 'qr_scanner', label: 'QR Scanner' },
    { value: 'card_reader', label: 'Card Reader' },
    { value: 'printer', label: 'Thermal Printer' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'other', label: 'Other' }
  ];

  const returnReasons = [
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_product', label: 'Wrong Product Delivered' },
    { value: 'damage_in_transit', label: 'Damage in Transit' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'warranty_claim', label: 'Warranty Claim' },
    { value: 'upgrade_request', label: 'Upgrade Request' },
    { value: 'excess_stock', label: 'Excess Stock' },
    { value: 'other', label: 'Other' }
  ];

  const returnConditions = [
    { value: 'new', label: 'New/Unused' },
    { value: 'good', label: 'Good Condition' },
    { value: 'fair', label: 'Fair Condition' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'not_working', label: 'Not Working' }
  ];

  const actionsTaken = [
    { value: 'replacement', label: 'Replacement Provided' },
    { value: 'refund', label: 'Refund Processed' },
    { value: 'repair', label: 'Sent for Repair' },
    { value: 'credit_note', label: 'Credit Note Issued' },
    { value: 'exchange', label: 'Exchange' },
    { value: 'pending', label: 'Pending Review' }
  ];

  const deliveryNumberOptions = outwardTransactions.map(transaction => ({
    value: transaction.deliveryNumber,
    label: `${transaction.deliveryNumber} - Qty: ${transaction.quantity} (${new Date(transaction.dispatchDate).toLocaleDateString()})`
  }));

  const handleSerialSelectionChange = useCallback((selectedSerials) => {
    setSelectedSerialNumbers(selectedSerials);
  }, []);

  const handleFormSubmit = async (data) => {
    const maxQuantity = parseInt(data.returnedQuantity) || 0;

    // Validation
    if (selectedSerialNumbers.length === 0) {
      const errorMsg = 'Please select at least one serial number for return';
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      return;
    }

    if (selectedSerialNumbers.length !== maxQuantity) {
      const errorMsg = `Please select exactly ${maxQuantity} serial numbers for return`;
      setError(errorMsg);
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare submission data to match backend DTO
      const submissionData = {
        returnNumber: data.returnNumber,
        originalDeliveryNumber: data.originalDeliveryNumber,
        franchiseId: data.customerType === 'franchise' ? parseInt(data.customerId) : null,
        merchantId: data.customerType === 'merchant' ? parseInt(data.customerId) : null,
        productId: parseInt(data.productId),
        returnDate: data.returnDate,
        receivedBy: data.receivedBy,
        originalQuantity: parseInt(data.quantity),
        returnedQuantity: parseInt(data.returnedQuantity),
        returnReason: data.returnReason,
        returnCondition: data.returnCondition,
        actionTaken: data.actionTaken,
        refundAmount: data.refundAmount ? parseFloat(data.refundAmount) : 0,
        approvedBy: data.approvedBy || null,
        isWarrantyReturn: data.isWarranty || false,
        isReplacementRequired: data.replacementRequired || false,
        inspectionNotes: data.inspectionNotes || null,
        remarks: data.remarks || null,
        serialNumbers: selectedSerialNumbers.map(serial => ({
          id: serial.id,
          mid: serial.mid,
          sid: serial.sid,
          tid: serial.tid,
          vpaid: serial.vpaid
        }))
      };

      

      // Call parent onSubmit
      if (onSubmit) {
        await onSubmit(submissionData);
      }

      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
      
      let errorMessage = `Failed to ${editData ? 'update' : 'create'} return transaction`;
      
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      if (showToast) {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    reset();
    setSelectedSerialNumbers([]);
    setProducts([]);
    setCustomers([]);
    setOutwardTransactions([]);
    setAvailableSerials([]);
    setSelectedDeliveryTransaction(null);
    setError(null);
    setIsSubmitting(false);
    if (onCancel) {
      onCancel();
    }
  }, [reset, onCancel]);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      {/* Modal Header */}
      <div className="flex justify-between items-center p-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          {editData ? 'Edit Return Entry' : 'Add New Return Entry'}
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

          {/* Return & Customer Details + Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Return & Customer Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Return & Customer Details</h3>
              <div className="space-y-4">
                <FormInput
                  label="Return Number"
                  name="returnNumber"
                  register={register}
                  errors={errors}
                  required
                  placeholder="Enter return number"
                  disabled={isSubmitting}
                />

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

                

                <FormInput
                  label="Return Date"
                  name="returnDate"
                  type="date"
                  register={register}
                  errors={errors}
                  required
                  disabled={isSubmitting}
                />

                <FormInput
                  label="Received By"
                  name="receivedBy"
                  register={register}
                  errors={errors}
                  required
                  placeholder="Enter receiver name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
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

                

                

                <FormSelect
                  label="Original Delivery Number"
                  name="originalDeliveryNumber"
                  register={register}
                  errors={errors}
                  options={deliveryNumberOptions}
                  loading={outwardTransactionsLoading}
                  placeholder={(!selectedProductId || !selectedCustomerId) ? 'Select product and customer first' : 'Select delivery number'}
                  required
                  disabled={isSubmitting || !selectedProductId || !selectedCustomerId}
                />

                <FormInput
                  label="Original Quantity"
                  name="quantity"
                  type="number"
                  register={register}
                  errors={errors}
                  required
                  min="1"
                  placeholder="Auto-filled from delivery"
                  disabled={true}
                />

                <FormInput
                  label="Returned Quantity"
                  name="returnedQuantity"
                  type="number"
                  register={register}
                  errors={errors}
                  required
                  min="1"
                  max={watch('quantity') || undefined}
                  placeholder="Enter returned quantity"
                  disabled={isSubmitting || !selectedDeliveryNumber}
                />
                {availableSerials.length > 0 && returnedQuantity && parseInt(returnedQuantity) > availableSerials.length && (
                  <p className="mt-1 text-sm text-amber-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Returned quantity exceeds available serial numbers ({availableSerials.length})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Information Display */}
          {selectedDeliveryTransaction && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Selected Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Delivery Number:</span>
                  <div className="text-gray-900">{selectedDeliveryTransaction.deliveryNumber}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dispatch Date:</span>
                  <div className="text-gray-900">{new Date(selectedDeliveryTransaction.dispatchDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="text-gray-900">{selectedDeliveryTransaction.quantity}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Product Code:</span>
                  <div className="text-gray-900">{selectedDeliveryTransaction.productCode}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dispatched By:</span>
                  <div className="text-gray-900">{selectedDeliveryTransaction.dispatchedBy}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Serial Numbers:</span>
                  <div className="text-gray-900">{selectedDeliveryTransaction.serialNumbers?.length || 0} available</div>
                </div>
              </div>
            </div>
          )}

          {/* Serial Numbers Grid - Full Width */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Serial Numbers Selection for Return</h3>
            <SerialNumberGrid
              availableSerials={availableSerials}
              returnedQuantity={returnedQuantity || 0}
              onSelectionChange={handleSerialSelectionChange}
              loading={false}
            />
          </div>

          {/* Return Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Return Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <FormSelect
                label="Return Reason"
                name="returnReason"
                register={register}
                errors={errors}
                required
                options={returnReasons}
                disabled={isSubmitting}
              />
              <FormSelect
                label="Return Condition"
                name="returnCondition"
                register={register}
                errors={errors}
                required
                options={returnConditions}
                disabled={isSubmitting}
              />
              <FormSelect
                label="Action Taken"
                name="actionTaken"
                register={register}
                errors={errors}
                required
                options={actionsTaken}
                disabled={isSubmitting}
              />
              <FormInput
                label="Refund Amount"
                name="refundAmount"
                type="number"
                register={register}
                errors={errors}
                step="0.01"
                min="0"
                placeholder="Enter refund amount"
                disabled={isSubmitting}
              />
              <FormInput
                label="Approved By"
                name="approvedBy"
                register={register}
                errors={errors}
                placeholder="Enter approver name"
                disabled={isSubmitting}
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <Controller
                  name="isWarranty"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      {...field}
                      value=""
                      checked={field.value}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  )}
                />
                <label className="text-sm text-gray-700">
                  This is a warranty return
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Controller
                  name="replacementRequired"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      {...field}
                      value=""
                      checked={field.value}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  )}
                />
                <label className="text-sm text-gray-700">
                  Replacement required
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label="Inspection Notes"
                name="inspectionNotes"
                register={register}
                errors={errors}
                rows={4}
                placeholder="Enter detailed inspection notes"
                disabled={isSubmitting}
              />
              <FormTextarea
                label="Remarks"
                name="remarks"
                register={register}
                errors={errors}
                rows={4}
                placeholder="Enter any additional remarks"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
              className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={
                isSubmitting || 
                !selectedDeliveryNumber || 
                (returnedQuantity && selectedSerialNumbers.length !== parseInt(returnedQuantity))
              }
            >
              {isSubmitting && <LoadingSpinner />}
              <span>
                {isSubmitting
                  ? (editData ? 'Updating...' : 'Processing...')
                  : (editData ? 'Update Return' : 'Process Return')
                }
              </span>
            </button>
          </div>

          {/* Form Status */}
          {returnedQuantity && availableSerials.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-sm text-red-700">
                <div className="flex-1">
                  <strong>Return Status:</strong>
                  <div className="mt-1">
                    • Quantity to return: {returnedQuantity}
                  </div>
                  <div>
                    • Serial numbers selected: {selectedSerialNumbers.length}
                  </div>
                  <div>
                    • Available for return: {availableSerials.length}
                  </div>
                </div>
                <div className="ml-4">
                  {selectedSerialNumbers.length === parseInt(returnedQuantity) ? (
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

          {/* Loading States Display */}
          {outwardTransactionsLoading && selectedProductId && selectedCustomerId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-blue-700 text-sm">Loading delivery records...</span>
              </div>
            </div>
          )}

          {outwardTransactions.length === 0 && selectedProductId && selectedCustomerId && !outwardTransactionsLoading && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-700 text-sm">
                  No delivery records found for the selected product and customer combination.
                </span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default OptimizedReturns;