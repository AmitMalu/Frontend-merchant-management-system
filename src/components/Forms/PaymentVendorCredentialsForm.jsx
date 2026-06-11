import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../constants/API/axiosInstance";



//Simple Select component (replace with react-select if available)
const Select = ({ options, value, onChange, isSearchable, isClearable }) => {
    return (
        <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={value?.value || ""}
            onChange={(e) => {
                const selected = options.find(opt => opt.value === Number(e.target.value));
                onChange(selected || null);
            }}
        >
            <option value="">Select...</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
};

// Input Field Component
const InputField = ({ label, name, register, errors, required = false, isEditMode = false }) => {
    const showRequired = required && !isEditMode;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {showRequired && "*"}
            </label>
            <input
                type="text"
                {...register(name)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}
        </div>
    );
};

// const formSchema = z.object({
//     vendorId: z.number().min(1, "Select a vendor"),
//     productId: z.number().nullable().optional(),

//     // UAT
//     baseUrlUat: z.string().min(1, "Required"),
//     secretKeyUat: z.string().min(1, "Required"),
//     saltKeyUat: z.string().min(1, "Required"),
//     encryptDecryptKeyUat: z.string().min(1, "Required"),
//     userIdUat: z.string().min(1, "Required"),

//     // PROD
//     baseUrlProd: z.string().nullable().optional(),
//     secretKeyProd: z.string().nullable().optional(),
//     saltKeyProd: z.string().nullable().optional(),
//     encryptDecryptKeyProd: z.string().nullable().optional(),
//     userIdProd: z.string().nullable().optional(),

//     activeEnvironment: z.enum(["UAT", "PROD"]),
//     isActive: z.boolean()
// });

const defaultForm = {
    vendorId: null,
    productId: null,

    baseUrlUat: "",
    secretKeyUat: "",
    saltKeyUat: "",
    encryptDecryptKeyUat: "",
    userIdUat: "",

    baseUrlProd: "",
    secretKeyProd: "",
    saltKeyProd: "",
    encryptDecryptKeyProd: "",
    userIdProd: "",

    activeEnvironment: "UAT",
    isActive: true
};

const PaymentVendorCredentialsForm = ({ isOpen = true, onClose = () => { }, defaultValues = null, onSubmit }) => {

    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const isEditMode = !!defaultValues;

    // Create conditional schema
    const formSchema = isEditMode
        ? z.object({
            vendorId: z.number().min(1, "Select a vendor"),
            productId: z.number().nullable().optional(),

            // UAT - optional in edit mode
            baseUrlUat: z.string().optional(),
            secretKeyUat: z.string().optional(),
            saltKeyUat: z.string().optional(),
            encryptDecryptKeyUat: z.string().optional(),
            userIdUat: z.string().optional(),

            // PROD - optional
            baseUrlProd: z.string().nullable().optional(),
            secretKeyProd: z.string().nullable().optional(),
            saltKeyProd: z.string().nullable().optional(),
            encryptDecryptKeyProd: z.string().nullable().optional(),
            userIdProd: z.string().nullable().optional(),

            activeEnvironment: z.enum(["UAT", "PROD"]),
            isActive: z.boolean()
        })
        : z.object({
            vendorId: z.number().min(1, "Select a vendor"),
            productId: z.number().nullable().optional(),

            // UAT - required in create mode
            baseUrlUat: z.string().min(1, "Required"),
            secretKeyUat: z.string().min(1, "Required"),
            saltKeyUat: z.string().min(1, "Required"),
            encryptDecryptKeyUat: z.string().min(1, "Required"),
            userIdUat: z.string().min(1, "Required"),

            // PROD - optional
            baseUrlProd: z.string().nullable().optional(),
            secretKeyProd: z.string().nullable().optional(),
            saltKeyProd: z.string().nullable().optional(),
            encryptDecryptKeyProd: z.string().nullable().optional(),
            userIdProd: z.string().nullable().optional(),

            activeEnvironment: z.enum(["UAT", "PROD"]),
            isActive: z.boolean()
        });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || defaultForm,
        mode: "onBlur"
    });

    const vendorId = watch("vendorId");
    const productId = watch("productId");

    // Fetch dropdown data
    const fetchDropdownData = async () => {
        try {
            setLoading(true);

            const [productsResponse, vendorsResponse] = await Promise.all([
                api.get('/payment-products/id-name'),
                api.get('/payment-vendors/id-name')
            ]);

            setProducts(productsResponse.data || []);
            setVendors(vendorsResponse.data || []);
        } catch (err) {
            console.error("Error fetching dropdown data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Reset form when editing
    useEffect(() => {
        if (defaultValues) {
            reset({
                ...defaultValues,
                vendorId: defaultValues.vendorId,
                productId: defaultValues.productId
            });
        } else {
            reset(defaultForm);
        }
    }, [defaultValues, reset]);

    if (!isOpen) return null;

    const onFormSubmit = (data) => {
        const payload = { ...data };
        if (!data.productId) payload.productId = null;
        onSubmit && onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white">
                    <h3 className="text-lg font-semibold">
                        {defaultValues ? "Edit Vendor Credentials" : "Add Vendor Credentials"}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">

                    {/* Vendor & Product */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                            <Select
                                isSearchable
                                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                                value={vendors.find(v => v.id === vendorId) ? { value: vendorId, label: vendors.find(v => v.id === vendorId).name } : null}
                                onChange={(opt) => setValue("vendorId", opt?.value, { shouldValidate: true })}
                            />
                            {errors.vendorId && <p className="text-red-500 text-xs mt-1">{errors.vendorId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
                            <Select
                                isSearchable
                                options={products.map(p => ({ value: p.id, label: p.productName }))}
                                value={products.find(p => p.id === productId) ? { value: productId, label: products.find(p => p.id === productId).productName } : null}
                                onChange={(opt) => setValue("productId", opt?.value || null)}
                                isClearable
                            />
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ENV Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Active Environment *</label>
                            <select
                                {...register("activeEnvironment")}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="UAT">UAT</option>
                                <option value="PROD">PROD</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                {...register("isActive", { setValueAs: v => v === "true" || v === true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                    </div>

                    {/* UAT Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="font-semibold text-gray-700 mb-3">UAT / Sandbox Credentials</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Base URL" name="baseUrlUat" register={register} errors={errors} required isEditMode />
                            <InputField label="Secret Key" name="secretKeyUat" register={register} errors={errors} required isEditMode />
                            <InputField label="Salt Key" name="saltKeyUat" register={register} errors={errors} required isEditMode />
                            <InputField label="Encrypt/Decrypt Key" name="encryptDecryptKeyUat" register={register} errors={errors} required isEditMode />
                            <InputField label="User ID" name="userIdUat" register={register} errors={errors} required isEditMode  />
                        </div>
                    </div>

                    {/* PROD Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="font-semibold text-gray-700 mb-3">Production Credentials</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Base URL" name="baseUrlProd" register={register} errors={errors} />
                            <InputField label="Secret Key" name="secretKeyProd" register={register} errors={errors} />
                            <InputField label="Salt Key" name="saltKeyProd" register={register} errors={errors} />
                            <InputField label="Encrypt/Decrypt Key" name="encryptDecryptKeyProd" register={register} errors={errors} />
                            <InputField label="User ID" name="userIdProd" register={register} errors={errors} />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onFormSubmit)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        {defaultValues ? "Update" : "Create"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentVendorCredentialsForm;