import React, { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

/**
 * Admin: reload the Bill Avenue biller list (categories and providers) for the active environment.
 * Step 1 "Preview" changes nothing and shows what would happen. Step 2 "Save" writes it.
 */
const BillAvenueBillerSyncModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [saved, setSaved] = useState(null);
    const [removeStale, setRemoveStale] = useState(false);
    const [idsText, setIdsText] = useState("");

    // Biller IDs pasted by the admin: separated by new lines, spaces, commas or semicolons.
    const billerIds = idsText.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);

    if (!isOpen) return null;

    const call = async (dryRun) => {
        setLoading(true);
        try {
            const res = await api.post("/billpay/config/sync-billers", { dryRun, removeStale, billerIds });
            return res.data?.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not reach Bill Avenue");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        setSaved(null);
        const result = await call(true);
        if (result) setPreview(result);
    };

    const handleSave = async () => {
        const removing = removeStale && preview?.notInBillAvenueList > 0;
        const text =
            `Save ${preview.added} new and ${preview.updated} changed billers from Bill Avenue (${preview.environment})?` +
            (removing ? `\n\nAlso REMOVE ${preview.notInBillAvenueList} saved billers that Bill Avenue did not list. This cannot be undone.` : "");
        if (!window.confirm(text)) return;
        const result = await call(false);
        if (result) {
            setSaved(result);
            setPreview(null);
            toast.success("Billers saved");
        }
    };

    const shown = saved || preview;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4 flex items-center justify-between text-white rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-semibold">Sync Bill Avenue Billers</h3>
                        <p className="text-sm text-blue-100 mt-0.5">Reload categories and providers from Bill Avenue</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 text-sm text-gray-700">
                    <p>
                        This loads biller details from Bill Avenue, using the <b>active environment</b> set in the credentials
                        (UAT or PROD). Press <b>Preview</b> first: nothing is changed until you press <b>Save</b>.
                    </p>

                    <div>
                        <label className="block font-medium mb-1">Biller IDs to load</label>
                        <textarea
                            value={idsText}
                            onChange={(e) => { setIdsText(e.target.value); setPreview(null); setSaved(null); }}
                            rows={5}
                            placeholder="Paste biller IDs: one per line, or separated by commas. Each ID is 14 letters/digits, for example AXIS00000NATKF"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {billerIds.length} ID{billerIds.length !== 1 ? "s" : ""} entered. Bill Avenue takes up to 2000 per request and
                            allows only 15 such requests a day. Leave empty to ask for the complete list, which Bill Avenue may refuse.
                        </p>
                    </div>

                    <label className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            checked={removeStale}
                            onChange={(e) => { setRemoveStale(e.target.checked); setPreview(null); setSaved(null); }}
                            className="mt-1"
                        />
                        <span>Also remove saved billers that Bill Avenue does not list (for example old staging billers).</span>
                    </label>

                    <button
                        onClick={handlePreview}
                        disabled={loading}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        {loading ? "Contacting Bill Avenue..." : "Preview"}
                    </button>

                    {shown && (
                        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                            <p className="font-semibold text-gray-800">
                                {saved ? "Saved" : "Preview (nothing saved yet)"} - environment: {shown.environment}
                            </p>
                            {shown.environment !== "PROD" && (
                                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                                    The active environment is {shown.environment}, not PROD. These are not production billers.
                                </p>
                            )}
                            <ul className="list-disc pl-5 space-y-0.5">
                                <li>Billers returned by Bill Avenue: <b>{shown.fetched}</b></li>
                                <li>New: <b>{shown.added}</b></li>
                                <li>Changed: <b>{shown.updated}</b></li>
                                <li>Already up to date: <b>{shown.unchanged}</b></li>
                                <li>
                                    Saved here but not in Bill Avenue's list: <b>{shown.notInBillAvenueList}</b>
                                    {shown.notInBillAvenueListLookingLikeStaging > 0 && ` (${shown.notInBillAvenueListLookingLikeStaging} look like staging)`}
                                </li>
                                {saved && <li>Removed: <b>{shown.removed}</b></li>}
                            </ul>

                            {shown.notInBillAvenueListSample?.length > 0 && (
                                <div>
                                    <p className="font-medium mt-2">Examples not in Bill Avenue's list:</p>
                                    <ul className="list-disc pl-5 text-xs text-gray-600">
                                        {shown.notInBillAvenueListSample.map((s) => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {shown.categories && (
                                <div>
                                    <p className="font-medium mt-2">Billers per category:</p>
                                    <div className="text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 max-h-40 overflow-auto">
                                        {Object.entries(shown.categories).map(([name, count]) => (
                                            <span key={name}>{name}: {count}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                        Close
                    </button>
                    {preview && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            Save to database
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillAvenueBillerSyncModal;
