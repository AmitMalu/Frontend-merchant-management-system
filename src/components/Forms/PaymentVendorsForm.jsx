// src/components/Forms/PaymentVendorsForm.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import api from "../../constants/API/axiosInstance";

const formSchema = z.object({
    vendorName: z.string().min(1, "Vendor name is required"),
    supportedModeIds: z.array(z.number()).min(1, "Select at least one mode"),
    status: z.boolean()
});

const defaultForm = {
    vendorName: "",
    supportedModeIds: [],
    status: true
};

const PaymentVendorsForm = ({ isOpen, onClose, defaultValues = null, onSubmit }) => {
    const [modes, setModes] = useState([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
        useForm({
            resolver: zodResolver(formSchema),
            defaultValues: defaultValues || defaultForm,
            mode: "onBlur"
        });

    const selectedModeIds = watch("supportedModeIds") || [];

    // fetch backend payout modes
    const fetchModes = async () => {
        try {
            const res = await api.get("/payment-modes");
            const opts = res.data.data.map(m => ({
                value: m.id,
                label: `${m.code} — ${m.description}`
            }));
            setModes(opts);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchModes();
    }, []);

    useEffect(() => {
        if (defaultValues) {
            reset({
                ...defaultValues,
                supportedModeIds: defaultValues.supportedModes?.map(m => m.id) || []
            });
        } else {
            reset(defaultForm);
        }
    }, [defaultValues, reset]);

    if (!isOpen) return null;

    const onForm = (data) => {
        const payload = {
            vendorName: data.vendorName,
            supportedModeIds: data.supportedModeIds,
            status: data.status
        };
        onSubmit && onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white">
                    <h3 className="text-lg font-semibold">
                        {defaultValues ? "Edit Payment Vendor" : "Add Payment Vendor"}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    {/* Vendor Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Vendor Name *</label>
                        <input
                            {...register("vendorName")}
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        {errors.vendorName && (
                            <p className="text-red-500 text-xs mt-1">{errors.vendorName.message}</p>
                        )}
                    </div>

                    {/* Supported Modes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Supported Modes *</label>

                        <Select
                            isMulti
                            options={modes}
                            value={modes.filter(opt => selectedModeIds.includes(opt.value))}
                            onChange={(selected) =>
                                setValue("supportedModeIds", selected.map(s => s.value), {
                                    shouldValidate: true
                                })
                            }
                            className="text-sm"
                        />

                        {errors.supportedModeIds && (
                            <p className="text-red-500 text-xs mt-1">{errors.supportedModeIds.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            {...register("status", { setValueAs: v => v === "true" || v === true })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg">Cancel</button>
                    <button onClick={handleSubmit(onForm)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                        {defaultValues ? "Update" : "Create"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaymentVendorsForm;
