import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import FormShimmer from '../Shimmer/FormShimmer';

const vendorRuleSchema = z.object({
    vendorId: z.coerce.number().min(1, 'Vendor is required'),
    vendorName: z.string().optional(),
    minAmount: z.coerce
        .number()
        .min(0, 'Min amount required')
        .refine(val => !isNaN(val), 'Must be a valid number'),
    maxAmount: z.coerce
        .number()
        .min(0, 'Max amount required')
        .refine(val => !isNaN(val), 'Must be a valid number'),
    dailyTransactionLimit: z.coerce
        .number()
        .min(1, 'Transaction limit required')
        .refine(val => !isNaN(val), 'Must be a valid number'),
    dailyAmountLimit: z.coerce
        .number()
        .min(0, 'Amount limit required')
        .refine(val => !isNaN(val), 'Must be a valid number'),
});

const formSchema = z.object({
    payoutProductId: z.coerce.number().min(1, 'Product is required'),
    vendor1Id: z.coerce.number().min(1, 'Vendor 1 is required'),
    vendor2Id: z.coerce.number().min(1, 'Vendor 2 is required'),
    vendor3Id: z.coerce.number().min(1, 'Vendor 3 is required'),
    vendorRules: z.array(vendorRuleSchema).length(3, 'All 3 vendors must have rules'),
}).refine(data => {
    const ids = [data.vendor1Id, data.vendor2Id, data.vendor3Id];
    return new Set(ids).size === 3;
}, {
    message: 'All three vendors must be different',
    path: ['vendor1Id'],
});

const PaymentVendorRoutingForm = ({ isOpen, onClose, defaultValues = null, onSubmit }) => {
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues ? {
            payoutProductId: defaultValues.payoutProductId,
            vendor1Id: defaultValues.vendor1?.id || '',
            vendor2Id: defaultValues.vendor2?.id || '',
            vendor3Id: defaultValues.vendor3?.id || '',
            vendorRules: defaultValues.vendorRules || [],
        } : {
            payoutProductId: '',
            vendor1Id: '',
            vendor2Id: '',
            vendor3Id: '',
            vendorRules: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'vendorRules',
    });

    const vendor1Id = watch('vendor1Id');
    const vendor2Id = watch('vendor2Id');
    const vendor3Id = watch('vendor3Id');
    const payoutProductId = watch('payoutProductId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, vendorsResponse] = await Promise.all([
                    api.get('/payment-products/id-name'),
                    api.get('/payment-vendors/id-name')
                ]);

                setProducts(productsResponse.data || []);
                setVendors(vendorsResponse.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (vendor1Id && vendor2Id && vendor3Id) {
            const selectedVendorIds = [
                Number(vendor1Id),
                Number(vendor2Id),
                Number(vendor3Id)
            ];

            const newRules = [];

            selectedVendorIds.forEach(vendorId => {
                const vendor = vendors.find(v => v.id === vendorId);
                const existingRule = fields.find(f => Number(f.vendorId) === vendorId);

                if (existingRule) {
                    newRules.push(existingRule);
                } else {
                    newRules.push({
                        vendorId: vendorId,
                        vendorName: vendor?.name || '',
                        minAmount: '',
                        maxAmount: '',
                        dailyTransactionLimit: '',
                        dailyAmountLimit: '',
                    });
                }
            });

            replace(newRules);
        } else {
            replace([]);
        }
    }, [vendor1Id, vendor2Id, vendor3Id, vendors]);

    if (!isOpen) return null;

    if (loading) {
        return <FormShimmer />
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="text-center text-red-500">{error}</div>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
                </div>
            </div>
        );
    }

    const getAvailableVendors = (currentVendorField) => {
        const selectedIds = [vendor1Id, vendor2Id, vendor3Id]
            .filter(id => id && id !== currentVendorField)
            .map(id => Number(id));

        return vendors.filter(v => !selectedIds.includes(v.id));
    };

    const onFormSubmit = (data) => {
        console.log('Form submitted:', data);
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {defaultValues ? 'Edit Vendor Routing' : 'Add Vendor Routing'}
                        </h2>
                        <p className="text-blue-100 text-sm mt-0.5">
                            {defaultValues ? 'Update vendor routing configuration' : 'Configure vendor routing rules for product'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('payoutProductId')}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.productName} | {product.productCode}
                                    </option>
                                ))}
                            </select>
                            {errors.payoutProductId && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.payoutProductId.message}
                                </p>
                            )}
                        </div>

                        {payoutProductId && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Vendor Priority Selection <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Vendor 1 (Priority 1) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('vendor1Id')}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                        >
                                            <option value="">Select Vendor 1</option>
                                            {getAvailableVendors(vendor1Id).map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                            ))}
                                        </select>
                                        {errors.vendor1Id && (
                                            <p className="text-red-500 text-xs mt-1">{errors.vendor1Id.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Vendor 2 (Priority 2) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('vendor2Id')}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                        >
                                            <option value="">Select Vendor 2</option>
                                            {getAvailableVendors(vendor2Id).map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                            ))}
                                        </select>
                                        {errors.vendor2Id && (
                                            <p className="text-red-500 text-xs mt-1">{errors.vendor2Id.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Vendor 3 (Priority 3) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('vendor3Id')}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                        >
                                            <option value="">Select Vendor 3</option>
                                            {getAvailableVendors(vendor3Id).map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                            ))}
                                        </select>
                                        {errors.vendor3Id && (
                                            <p className="text-red-500 text-xs mt-1">{errors.vendor3Id.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {fields.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Vendor Rules</label>
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    {field.vendorName}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                        Min Amount *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        {...register(`vendorRules.${index}.minAmount`)}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    />
                                                    {errors.vendorRules?.[index]?.minAmount && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.vendorRules[index].minAmount.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                        Max Amount *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        {...register(`vendorRules.${index}.maxAmount`)}
                                                        placeholder="10000"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    />
                                                    {errors.vendorRules?.[index]?.maxAmount && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.vendorRules[index].maxAmount.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                        Daily Txn Count *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        {...register(`vendorRules.${index}.dailyTransactionLimit`)}
                                                        placeholder="100"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    />
                                                    {errors.vendorRules?.[index]?.dailyTransactionLimit && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.vendorRules[index].dailyTransactionLimit.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                        Daily Amt Limit *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        {...register(`vendorRules.${index}.dailyAmountLimit`)}
                                                        placeholder="50000"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    />
                                                    {errors.vendorRules?.[index]?.dailyAmountLimit && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.vendorRules[index].dailyAmountLimit.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.vendorRules && typeof errors.vendorRules.message === 'string' && (
                                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                        {errors.vendorRules.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onFormSubmit)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                    >
                        {defaultValues ? 'Update Routing' : 'Add Routing'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentVendorRoutingForm;