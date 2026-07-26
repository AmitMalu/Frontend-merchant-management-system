// src/components/Forms/PaymentChargesForm.jsx
import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../constants/API/axiosInstance";
import Select from "react-select";

// ─── Zod schema — slabs intentionally excluded, managed in useState ──────────
const formSchema = z.object({
    modeId: z.coerce.number().min(1, "Mode required"),
    chargeScope: z.enum(["GLOBAL", "DIRECT_MERCHANT", "FRANCHISE", "FRANCHISE_MERCHANT"]),
    merchantId: z.coerce.number().nullable().optional(),
    franchiseId: z.coerce.number().nullable().optional(),
    status: z.boolean(),
});

const defaultForm = {
    modeId: "",
    chargeScope: "GLOBAL",
    merchantId: null,
    franchiseId: null,
    status: true,
};

// ─── Scope config ─────────────────────────────────────────────────────────────
const SCOPE_OPTIONS = [
    { value: "GLOBAL", label: "Global" },
    { value: "DIRECT_MERCHANT", label: "Direct Merchant" },
    { value: "FRANCHISE", label: "Franchise" },
    { value: "FRANCHISE_MERCHANT", label: "Franchise Merchant" },
];

// ─── Main component ───────────────────────────────────────────────────────────
const PaymentChargesForm = ({ isOpen, onClose, defaultValues = null, onSubmit }) => {
    const [modes, setModes] = useState([]);

    // Dropdown data
    const [directMerchants, setDirectMerchants] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [franchiseMerchants, setFranchiseMerchants] = useState([]);

    // Loading flags
    const [loadingMerchants, setLoadingMerchants] = useState(false);
    const [loadingFranchises, setLoadingFranchises] = useState(false);
    const [loadingFranchiseMerchants, setLoadingFranchiseMerchants] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues ? {
            modeId: defaultValues.modeId || defaultValues.mode?.id || "",
            chargeScope: defaultValues.chargeScope || "GLOBAL",
            merchantId: defaultValues.merchantId ?? null,
            franchiseId: defaultValues.franchiseId ?? null,
            status: defaultValues.status ?? true,
        } : defaultForm,
        mode: "onBlur"
    });

    // slabs managed in plain state — NOT via react-hook-form
    const [slabs, setSlabs] = useState(defaultValues?.slabs || []);
    const chargeScope = watch("chargeScope");
    const franchiseId = watch("franchiseId");

    const [newSlab, setNewSlab] = useState({
        minAmount: "", maxAmount: "", chargeType: "FLAT", chargeValue: ""
    });
    const [slabError, setSlabError] = useState("");

    // ── Fetch payment modes ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchModes = async () => {
            try {
                const res = await api.get("/payment-modes");
                setModes(res.data.data.map(m => ({
                    value: m.id,
                    label: `${m.code} — ${m.description}`
                })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchModes();
    }, []);

    // ── Fetch direct merchants (franchise == null) for DIRECT_MERCHANT scope ──
    useEffect(() => {
        if (chargeScope !== "DIRECT_MERCHANT") return;
        const fetch = async () => {
            setLoadingMerchants(true);
            try {
                const res = await api.get("/merchants/direct-merchant");
                setDirectMerchants(res.data);
            } catch (err) {
                console.error(err);
                setDirectMerchants([]);
            } finally {
                setLoadingMerchants(false);
            }
        };
        fetch();
    }, [chargeScope]);

    // ── Fetch franchises for FRANCHISE / FRANCHISE_MERCHANT scopes ────────────
    useEffect(() => {
        if (chargeScope !== "FRANCHISE" && chargeScope !== "FRANCHISE_MERCHANT") return;
        const fetch = async () => {
            setLoadingFranchises(true);
            try {
                const res = await api.get("/franchise");
                setFranchises(res.data);
            } catch (err) {
                console.error(err);
                setFranchises([]);
            } finally {
                setLoadingFranchises(false);
            }
        };
        fetch();
    }, [chargeScope]);

    // ── Fetch franchise merchants when franchise is selected ───────────────────
    useEffect(() => {
        if (chargeScope !== "FRANCHISE_MERCHANT" || !franchiseId) {
            setFranchiseMerchants([]);
            return;
        }
        const fetch = async () => {
            setLoadingFranchiseMerchants(true);
            try {
                const res = await api.get(`/merchants/franchise/${franchiseId}`);
                setFranchiseMerchants(res.data);
            } catch (err) {
                console.error(err);
                setFranchiseMerchants([]);
            } finally {
                setLoadingFranchiseMerchants(false);
            }
        };
        fetch();
    }, [chargeScope, franchiseId]);

    // ── Reset dependent IDs when scope changes (skip on initial mount) ────────
    const isMountRef = React.useRef(true);
    useEffect(() => {
        if (isMountRef.current) {
            isMountRef.current = false;
            return;
        }
        setValue("merchantId", null);
        setValue("franchiseId", null);
        setFranchiseMerchants([]);
    }, [chargeScope, setValue]);

    // ── Reset franchise merchants when franchise changes (for FRANCHISE_MERCHANT) ─
    useEffect(() => {
        if (chargeScope === "FRANCHISE_MERCHANT") {
            setValue("merchantId", null);
        }
    }, [franchiseId, chargeScope, setValue]);

    // ── Populate form when editing ────────────────────────────────────────────
    useEffect(() => {
        if (defaultValues) {
            reset({
                modeId: defaultValues.modeId || defaultValues.mode?.id || "",
                chargeScope: defaultValues.chargeScope || "GLOBAL",
                merchantId: defaultValues.merchantId ?? null,
                franchiseId: defaultValues.franchiseId ?? null,
                status: defaultValues.status ?? true,
            });
            setSlabs(defaultValues.slabs || []);
        } else {
            reset(defaultForm);
            setSlabs([]);
        }
    }, [defaultValues, reset]);

    if (!isOpen) return null;

    // ── Slab helpers ──────────────────────────────────────────────────────────
    const addSlab = () => {

        if (
            newSlab.minAmount === "" ||
            newSlab.maxAmount === "" ||
            newSlab.chargeValue === ""
        ) {
            setSlabError("Enter all slab fields.");
            return;
        }

        const entry = {
            minAmount: Number(newSlab.minAmount),
            maxAmount: Number(newSlab.maxAmount),
            chargeType: newSlab.chargeType,
            chargeValue: Number(newSlab.chargeValue)
        };

        if (entry.minAmount >= entry.maxAmount) {
            setSlabError(
                "Minimum amount must be less than maximum amount."
            );
            return;
        }

        if (entry.chargeValue < 0) {
            setSlabError("Charge value cannot be negative.");
            return;
        }

        if (
            entry.chargeType === "PERCENTAGE" &&
            entry.chargeValue > 100
        ) {
            setSlabError(
                "Percentage charge cannot be greater than 100."
            );
            return;
        }

        const updatedSlabs = [...slabs, entry].sort(
            (a, b) => Number(a.minAmount) - Number(b.minAmount)
        );

        for (let index = 1; index < updatedSlabs.length; index++) {

            if (
                Number(updatedSlabs[index].minAmount) <=
                Number(updatedSlabs[index - 1].maxAmount)
            ) {
                setSlabError(
                    "Charge slabs cannot overlap."
                );
                return;
            }
        }

        setSlabs(updatedSlabs);

        setNewSlab({
            minAmount: "",
            maxAmount: "",
            chargeType: "FLAT",
            chargeValue: ""
        });

        setSlabError("");
    };

    const removeSlab = (i) => {
        setSlabs(prev => prev.filter((_, idx) => idx !== i));
    };

    const updateSlab = (index, field, value) => {
        setSlabs(prev => prev.map((s, i) =>
            i === index
                ? { ...s, [field]: field === "chargeType" ? value : Number(value) }
                : s
        ));
    };

    // ── Build payload and submit ──────────────────────────────────────────────

    const onForm = (data) => {

        const hasPendingSlabData =
            newSlab.minAmount !== "" ||
            newSlab.maxAmount !== "" ||
            newSlab.chargeValue !== "";

        const isPendingSlabComplete =
            newSlab.minAmount !== "" &&
            newSlab.maxAmount !== "" &&
            newSlab.chargeType !== "" &&
            newSlab.chargeValue !== "";

        // User entered only some values in the add row
        if (hasPendingSlabData && !isPendingSlabComplete) {
            setSlabError(
                "Complete all fields in the new slab row or clear the row."
            );
            return;
        }

        let finalSlabs = [...slabs];

        // Automatically include the pending slab when Save/Update is clicked
        if (isPendingSlabComplete) {

            const pendingSlab = {
                minAmount: Number(newSlab.minAmount),
                maxAmount: Number(newSlab.maxAmount),
                chargeType: newSlab.chargeType,
                chargeValue: Number(newSlab.chargeValue)
            };

            if (pendingSlab.minAmount >= pendingSlab.maxAmount) {
                setSlabError(
                    "Minimum amount must be less than maximum amount."
                );
                return;
            }

            finalSlabs.push(pendingSlab);
        }

        if (finalSlabs.length === 0) {
            setSlabError("Add at least one slab before saving.");
            return;
        }

        // Sort slabs by minimum amount
        finalSlabs = finalSlabs.sort(
            (a, b) => Number(a.minAmount) - Number(b.minAmount)
        );

        // Validate all slabs
        for (let index = 0; index < finalSlabs.length; index++) {

            const slab = finalSlabs[index];

            if (
                slab.minAmount === "" ||
                slab.maxAmount === "" ||
                slab.chargeValue === ""
            ) {
                setSlabError(
                    `Complete all fields for slab ${index + 1}.`
                );
                return;
            }

            if (
                Number(slab.minAmount) >= Number(slab.maxAmount)
            ) {
                setSlabError(
                    `Minimum amount must be less than maximum amount in slab ${index + 1}.`
                );
                return;
            }

            if (Number(slab.chargeValue) < 0) {
                setSlabError(
                    `Charge value cannot be negative in slab ${index + 1}.`
                );
                return;
            }

            if (
                slab.chargeType === "PERCENTAGE" &&
                Number(slab.chargeValue) > 100
            ) {
                setSlabError(
                    `Percentage cannot exceed 100 in slab ${index + 1}.`
                );
                return;
            }
        }

        // Validate overlapping slabs
        for (let index = 1; index < finalSlabs.length; index++) {

            const previousSlab = finalSlabs[index - 1];
            const currentSlab = finalSlabs[index];

            if (
                Number(currentSlab.minAmount) <=
                Number(previousSlab.maxAmount)
            ) {
                setSlabError(
                    `Slab ${index + 1} overlaps with slab ${index}.`
                );
                return;
            }
        }

        setSlabError("");

        const payload = {
            modeId: Number(data.modeId),
            chargeScope: data.chargeScope,
            merchantId:
                data.merchantId !== null &&
                    data.merchantId !== undefined &&
                    data.merchantId !== ""
                    ? Number(data.merchantId)
                    : null,
            franchiseId:
                data.franchiseId !== null &&
                    data.franchiseId !== undefined &&
                    data.franchiseId !== ""
                    ? Number(data.franchiseId)
                    : null,
            status: Boolean(data.status),

            slabs: finalSlabs.map((slab) => ({
                minAmount: Number(slab.minAmount),
                maxAmount: Number(slab.maxAmount),
                chargeType: slab.chargeType,
                chargeValue: Number(slab.chargeValue)
            }))
        };

        console.log(
            "Payment charge request payload:",
            JSON.stringify(payload, null, 2)
        );

        onSubmit?.(payload);
    };

    const onFormError = (validationErrors) => {
        console.warn("Validation failed:", validationErrors);
        const messages = [];
        if (validationErrors.modeId) messages.push("Payment mode is required");
        if (validationErrors.chargeScope) messages.push("Charge scope is required");
        if (messages.length) alert(messages.join("\n"));
    };

    // ── Dropdown helpers ──────────────────────────────────────────────────────
    const showDirectMerchantDropdown = chargeScope === "DIRECT_MERCHANT";
    const showFranchiseDropdown = chargeScope === "FRANCHISE" || chargeScope === "FRANCHISE_MERCHANT";
    const showFranchiseMerchantDropdown = chargeScope === "FRANCHISE_MERCHANT" && !!franchiseId;

    // Scope badge colour
    const scopeColor = {
        GLOBAL: "bg-blue-100 text-blue-700",
        DIRECT_MERCHANT: "bg-green-100 text-green-700",
        FRANCHISE: "bg-purple-100 text-purple-700",
        FRANCHISE_MERCHANT: "bg-orange-100 text-orange-700",
    }[chargeScope] ?? "bg-gray-100 text-gray-700";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit(onForm, onFormError)}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {defaultValues ? "Edit Payment Charge" : "Add Payment Charge"}
                        </h3>
                        <p className="text-sm text-gray-300 mt-0.5">
                            Configure charge slabs per payment mode and scope
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">

                    {/* Row 1: Mode + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Payment Mode <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={modes}
                                value={modes.find(m => m.value === watch("modeId")) || null}
                                onChange={selected =>
                                    setValue("modeId", selected ? selected.value : null, { shouldValidate: true })
                                }
                                placeholder={modes.length === 0 ? "No modes available" : "Select mode"}
                                isClearable
                                className="text-sm"
                                maxMenuHeight={180}
                                menuPlacement="auto"
                                styles={{
                                    control: base => ({ ...base, borderRadius: "8px", padding: "2px", borderColor: "#d1d5db" })
                                }}
                            />
                            {errors.modeId && (
                                <p className="text-red-500 text-xs mt-1">{errors.modeId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                            <select
                                {...register("status", { setValueAs: v => v === "true" || v === true })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Charge Scope */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Charge Scope <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {SCOPE_OPTIONS.map(opt => (
                                <label
                                    key={opt.value}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${chargeScope === opt.value
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={opt.value}
                                        {...register("chargeScope")}
                                        className="accent-blue-600"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                        {errors.chargeScope && (
                            <p className="text-red-500 text-xs mt-1">{errors.chargeScope.message}</p>
                        )}

                        {/* Scope hint badge */}
                        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${scopeColor}`}>
                            {chargeScope === "GLOBAL" && "This charge applies to all merchants globally"}
                            {chargeScope === "DIRECT_MERCHANT" && "This charge applies to a specific direct merchant"}
                            {chargeScope === "FRANCHISE" && "This charge applies to all merchants under a franchise"}
                            {chargeScope === "FRANCHISE_MERCHANT" && "This charge applies to a specific merchant within a franchise"}
                        </div>
                    </div>

                    {/* Row 3: Conditional dropdowns */}
                    {(showFranchiseDropdown || showDirectMerchantDropdown) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">

                            {/* Direct Merchant */}
                            {showDirectMerchantDropdown && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Direct Merchant <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={loadingMerchants}
                                        value={watch("merchantId") ?? ""}
                                        onChange={e =>
                                            setValue("merchantId", e.target.value ? Number(e.target.value) : null, { shouldValidate: true })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {loadingMerchants ? "Loading..." : "Choose merchant..."}
                                        </option>
                                        {directMerchants.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.businessName} — {m.contactPersonName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Franchise */}
                            {showFranchiseDropdown && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Franchise <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={loadingFranchises}
                                        value={watch("franchiseId") ?? ""}
                                        onChange={e =>
                                            setValue("franchiseId", e.target.value ? Number(e.target.value) : null, { shouldValidate: true })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {loadingFranchises ? "Loading..." : "Choose franchise..."}
                                        </option>
                                        {franchises.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.franchiseName} — {f.contactPersonName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Franchise Merchant (only after franchise is selected) */}
                            {showFranchiseMerchantDropdown && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Merchant <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={loadingFranchiseMerchants}
                                        value={watch("merchantId") ?? ""}
                                        onChange={e =>
                                            setValue("merchantId", e.target.value ? Number(e.target.value) : null, { shouldValidate: true })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">
                                            {loadingFranchiseMerchants ? "Loading..." : "Choose merchant..."}
                                        </option>
                                        {franchiseMerchants.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.businessName} — {m.contactPersonName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Slabs */}
                    <div className="bg-gray-50 p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3 text-gray-800">Charge Slabs</h4>

                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-600">
                                    <th className="py-2 px-3">Min Amount</th>
                                    <th className="py-2 px-3">Max Amount</th>
                                    <th className="py-2 px-3">Type</th>
                                    <th className="py-2 px-3">Value</th>
                                    <th className="py-2 px-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slabs.map((s, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="py-2 px-3">
                                            <input type="number" value={s.minAmount}
                                                onChange={e => updateSlab(idx, "minAmount", e.target.value)}
                                                className="w-full px-2 py-1 border rounded" />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="number" value={s.maxAmount}
                                                onChange={e => updateSlab(idx, "maxAmount", e.target.value)}
                                                className="w-full px-2 py-1 border rounded" />
                                        </td>
                                        <td className="py-2 px-3">
                                            <select value={s.chargeType}
                                                onChange={e => updateSlab(idx, "chargeType", e.target.value)}
                                                className="px-2 py-1 border rounded">
                                                <option value="FLAT">Flat</option>
                                                <option value="PERCENTAGE">Percentage</option>
                                            </select>
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="number" step="0.01" value={s.chargeValue}
                                                onChange={e => updateSlab(idx, "chargeValue", e.target.value)}
                                                className="w-full px-2 py-1 border rounded" />
                                        </td>
                                        <td className="py-2 px-3">
                                            <button type="button" onClick={() => removeSlab(idx)}
                                                className="text-red-600 hover:text-red-800 text-xs">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Add row */}
                                <tr className="bg-white border-t-2 border-dashed border-gray-300">
                                    <td className="py-2 px-3">
                                        <input type="number" value={newSlab.minAmount}
                                            onChange={e => setNewSlab(p => ({ ...p, minAmount: e.target.value }))}
                                            className="w-full px-2 py-1 border rounded" placeholder="0" />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input type="number" value={newSlab.maxAmount}
                                            onChange={e => setNewSlab(p => ({ ...p, maxAmount: e.target.value }))}
                                            className="w-full px-2 py-1 border rounded" placeholder="1000" />
                                    </td>
                                    <td className="py-2 px-3">
                                        <select value={newSlab.chargeType}
                                            onChange={e => setNewSlab(p => ({ ...p, chargeType: e.target.value }))}
                                            className="px-2 py-1 border rounded">
                                            <option value="FLAT">Flat</option>
                                            <option value="PERCENTAGE">Percentage</option>
                                        </select>
                                    </td>
                                    <td className="py-2 px-3">
                                        <input type="number" step="0.01" value={newSlab.chargeValue}
                                            onChange={e => setNewSlab(p => ({ ...p, chargeValue: e.target.value }))}
                                            className="w-full px-2 py-1 border rounded" placeholder="2.5" />
                                    </td>
                                    <td className="py-2 px-3">
                                        <button type="button" onClick={addSlab}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded inline-flex items-center gap-1 text-xs">
                                            <Plus size={13} /> Add Slab
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {slabError && (
                            <p className="text-red-500 text-xs mt-2">{slabError}</p>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {defaultValues ? "Update" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentChargesForm;
