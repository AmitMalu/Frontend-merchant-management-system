// src/components/Forms/PaymentProductsForm.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import api from "../../constants/API/axiosInstance";

// Validation schema
const formSchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    productCode: z.string().min(1, "Product code is required"),
    status: z.boolean(),
    modeIds: z.array(z.number()).min(1, "Select at least one mode")
});

// Default form values
const defaultForm = {
    productName: "",
    productCode: "",
    status: true,
    modeIds: []
};

const PaymentProductsForm = ({ isOpen, onClose, defaultValues = null, onSubmit }) => {
    const [modes, setModes] = useState([]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
        useForm({
            resolver: zodResolver(formSchema),
            defaultValues: defaultValues || defaultForm,
            mode: "onBlur"
        });

    const selectedModeIds = watch("modeIds");

    // Fetch modes from backend
    const fetchModes = async () => {
        try {
            const res = await api.get("/payment-modes");
            const options = res.data.data.map(m => ({
                label: `${m.code} — ${m.description}`,
                value: m.id
            }));
            setModes(options);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchModes();
    }, []);

    // set default selected values
    useEffect(() => {
        if (defaultValues) {
            reset({
                ...defaultValues,
                modeIds: defaultValues.allowedModes?.map(m => m.id) || []
            });
        } else {
            reset(defaultForm);
        }
    }, [defaultValues, reset]);

    if (!isOpen) return null;

    const onForm = (data) => {
        const payload = {
            productName: data.productName,
            productCode: data.productCode,
            status: data.status,
            modeIds: data.modeIds
        };
        onSubmit && onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit(onForm)}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {defaultValues ? "Edit Payment Product" : "Add Payment Product"}
                        </h3>
                        <p className="text-sm text-purple-100 mt-0.5">
                            Configure payment product details
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    <div className="grid grid-cols-2 gap-2">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name *</label>
                            <input
                                {...register("productName")}
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            {errors.productName && (
                                <p className="text-red-500 text-xs mt-1">{errors.productName.message}</p>
                            )}
                        </div>

                        {/* Product Code */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Code *</label>
                            <input
                                {...register("productCode")}
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            {errors.productCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.productCode.message}</p>
                            )}
                        </div>
                   </div>

                    {/* Supported Modes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Supported Modes *</label>

                        <Select
                            isMulti
                            options={modes}
                            value={modes.filter(opt => selectedModeIds.includes(opt.value))}
                            onChange={(selected) =>
                                setValue(
                                    "modeIds",
                                    selected.map(s => s.value),
                                    { shouldValidate: true }
                                )
                            }
                            className="text-sm"
                        />

                        {errors.modeIds && (
                            <p className="text-red-500 text-xs mt-1">{errors.modeIds.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            {...register("status", {
                                setValueAs: v => v === "true" || v === true
                            })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                    <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                        {defaultValues ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentProductsForm;
