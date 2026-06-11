// src/components/Forms/PaymentChargesForm.jsx
import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../constants/API/axiosInstance";
import Select from "react-select";



const slabSchema = z.object({
    minAmount: z.coerce.number().min(0, "Min required"),
    maxAmount: z.coerce.number().min(0, "Max required"),
    chargeType: z.enum(["FLAT", "PERCENTAGE"]),
    chargeValue: z.coerce.number().min(0, "Charge value required")
});

const formSchema = z.object({
    modeId: z.number().min(1, "Mode required"),
    status: z.boolean(),
    slabs: z.array(slabSchema).min(1, "Add at least one slab")
}).refine(d => d.slabs.every(s => s.minAmount < s.maxAmount), {
    message: "Every slab: min must be less than max",
    path: ["slabs"]
});

const defaultForm = {
    modeId: "",
    status: true,
    slabs: []
};

const PaymentChargesForm = ({ isOpen, onClose, defaultValues = null, onSubmit }) => {
    const [modes, setModes] = useState([]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
        useForm({
            resolver: zodResolver(formSchema),
            defaultValues: defaultValues || defaultForm,
            mode: "onBlur"
        });

    const slabs = watch("slabs") || [];
    const [newSlab, setNewSlab] = useState({
        minAmount: "",
        maxAmount: "",
        chargeType: "FLAT",
        chargeValue: ""
    });

    // Load modes from backend
    const fetchModes = async () => {
        try {
            const res = await api.get("/payment-modes");
            const transformed = res.data.data.map(m => ({
                value: m.id,                  // REQUIRED
                label: `${m.code} — ${m.description}`,
                code: m.code
            }));

            setModes(transformed);
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
                modeId: defaultValues.mode?.id || "",
                status: defaultValues.status,
                slabs: defaultValues.slabs || []
            });
        } else {
            reset(defaultForm);
        }
    }, [defaultValues, reset]);

    if (!isOpen) return null;

    const addSlab = () => {
        if (!newSlab.minAmount || !newSlab.maxAmount || !newSlab.chargeValue) return alert("Enter all slab fields");

        const entry = {
            minAmount: Number(newSlab.minAmount),
            maxAmount: Number(newSlab.maxAmount),
            chargeType: newSlab.chargeType,
            chargeValue: Number(newSlab.chargeValue)
        };

        const updated = [...slabs, entry].sort((a, b) => a.minAmount - b.minAmount);
        setValue("slabs", updated, { shouldValidate: true });

        setNewSlab({ minAmount: "", maxAmount: "", chargeType: "FLAT", chargeValue: "" });
    };

    const removeSlab = (i) => {
        const updated = slabs.filter((_, idx) => idx !== i);
        setValue("slabs", updated, { shouldValidate: true });
    };

    const updateSlab = (index, field, value) => {
        const updated = slabs.map((s, i) =>
            i === index ? { ...s, [field]: field === "chargeType" ? value : Number(value) } : s
        );
        setValue("slabs", updated, { shouldValidate: true });
    };

    const onForm = (data) => {
        const payload = {
            modeId: data.modeId,
            status: data.status,
            slabs: data.slabs.map(s => ({
                minAmount: s.minAmount,
                maxAmount: s.maxAmount,
                chargeType: s.chargeType,
                chargeValue: s.chargeValue
            }))
        };

        onSubmit && onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit(onForm)}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 text-white flex justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {defaultValues ? "Edit Payment Charge" : "Add Payment Charge"}
                        </h3>
                        <p className="text-sm text-blue-100">
                            Global charge configuration for payment modes
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Mode */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Mode *</label>
                            <Select
                                options={modes}
                                value={modes.find(m => m.value === watch("modeId")) || null}
                                onChange={(selected) => {
                                    setValue("modeId", selected ? selected.value : null, { shouldValidate: true });
                                }}
                                placeholder={modes.length === 0 ? "No modes available" : "Select mode"}
                                isClearable
                                className="text-sm"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: "8px",
                                        padding: "2px",
                                        borderColor: "#d1d5db"
                                    })
                                }}
                            />

                            {errors.modeId && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.modeId.message}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select
                                {...register("status", {
                                    setValueAs: v => v === "true" || v === true
                                })}
                                className="w-full px-4 py-2.5 border rounded-lg"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Slabs */}
                    <div className="bg-gray-50 p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Slabs</h4>

                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-600">
                                    <th className="py-2 px-3">Min</th>
                                    <th className="py-2 px-3">Max</th>
                                    <th className="py-2 px-3">Type</th>
                                    <th className="py-2 px-3">Value</th>
                                    <th className="py-2 px-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {slabs.map((s, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                value={s.minAmount}
                                                onChange={e =>
                                                    updateSlab(idx, "minAmount", e.target.value)
                                                }
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>

                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                value={s.maxAmount}
                                                onChange={e =>
                                                    updateSlab(idx, "maxAmount", e.target.value)
                                                }
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>

                                        <td className="py-2 px-3">
                                            <select
                                                value={s.chargeType}
                                                onChange={e =>
                                                    updateSlab(idx, "chargeType", e.target.value)
                                                }
                                                className="px-2 py-1 border rounded"
                                            >
                                                <option value="FLAT">Flat</option>
                                                <option value="PERCENTAGE">Percentage</option>
                                            </select>
                                        </td>

                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={s.chargeValue}
                                                onChange={e =>
                                                    updateSlab(idx, "chargeValue", e.target.value)
                                                }
                                                className="w-full px-2 py-1 border rounded"
                                            />
                                        </td>

                                        <td className="py-2 px-3">
                                            <button
                                                type="button"
                                                onClick={() => removeSlab(idx)}
                                                className="text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Add row */}
                                <tr className="bg-gray-50">
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={newSlab.minAmount}
                                            onChange={e =>
                                                setNewSlab(prev => ({
                                                    ...prev,
                                                    minAmount: e.target.value
                                                }))
                                            }
                                            className="w-full px-2 py-1 border rounded"
                                            placeholder="0"
                                        />
                                    </td>

                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={newSlab.maxAmount}
                                            onChange={e =>
                                                setNewSlab(prev => ({
                                                    ...prev,
                                                    maxAmount: e.target.value
                                                }))
                                            }
                                            className="w-full px-2 py-1 border rounded"
                                            placeholder="1000"
                                        />
                                    </td>

                                    <td className="py-2 px-3">
                                        <select
                                            value={newSlab.chargeType}
                                            onChange={e =>
                                                setNewSlab(prev => ({
                                                    ...prev,
                                                    chargeType: e.target.value
                                                }))
                                            }
                                            className="px-2 py-1 border rounded"
                                        >
                                            <option value="FLAT">Flat</option>
                                            <option value="PERCENTAGE">Percentage</option>
                                        </select>
                                    </td>

                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newSlab.chargeValue}
                                            onChange={e =>
                                                setNewSlab(prev => ({
                                                    ...prev,
                                                    chargeValue: e.target.value
                                                }))
                                            }
                                            className="w-full px-2 py-1 border rounded"
                                            placeholder="2.5"
                                        />
                                    </td>

                                    <td className="py-2 px-3">
                                        <button
                                            type="button"
                                            onClick={addSlab}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded inline-flex items-center gap-2"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {errors.slabs && (
                            <p className="text-red-500 text-xs mt-2">{errors.slabs.message}</p>
                        )}
                    </div>
                </div>

                {/* footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentChargesForm;
