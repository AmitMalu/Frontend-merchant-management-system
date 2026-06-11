import React, { useEffect, useState } from "react";
import api from "../../constants/API/axiosInstance";
import { Loader2, Edit2, X, Check } from "lucide-react";
import { toast } from "react-toastify"; 

const TaxesManagement = () => {
    const [taxes, setTaxes] = useState({ gst: "", tds: "" });
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editValues, setEditValues] = useState({ gst: "", tds: "" });
    const [saving, setSaving] = useState(false);

    // Fetch taxes on mount
    useEffect(() => {
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/taxes");
            setTaxes({
                gst: data.gst || "",
                tds: data.tds || "",
            });
        } catch (err) {
            console.error("Error fetching taxes:", err);
            toast.error("Failed to fetch tax details");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditValues({ ...taxes });
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditValues({ gst: "", tds: "" });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/taxes", {
                gst: parseFloat(editValues.gst || 0),
                tds: parseFloat(editValues.tds || 0),
            });
            setTaxes(editValues);
            setEditing(false);
            toast.success("Taxes updated successfully!");
        } catch (err) {
            console.error("Error updating taxes:", err);
            toast.error("Failed to update taxes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">Tax Configuration</h1>
                    {!editing && (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tax Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rate (%)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    GST
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {editing ? (
                                        <input
                                            type="number"
                                            name="gst"
                                            value={editValues.gst}
                                            onChange={handleChange}
                                            className="w-32 rounded-md border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    ) : (
                                        <span className="font-medium">{taxes.gst}%</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    TDS
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {editing ? (
                                        <input
                                            type="number"
                                            name="tds"
                                            value={editValues.tds}
                                            onChange={handleChange}
                                            className="w-32 rounded-md border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    ) : (
                                        <span className="font-medium">{taxes.tds}%</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {editing && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxesManagement;