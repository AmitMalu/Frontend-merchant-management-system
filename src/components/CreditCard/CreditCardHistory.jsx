import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const formatMoney = (v) =>
    v == null ? '—' : `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (v) => (v ? new Date(v).toLocaleString('en-IN') : '—');

const errorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || fallback;

const STATUS_STYLE = {
    SUCCESS: 'bg-green-100 text-green-800',
    PENDING: 'bg-amber-100 text-amber-800',
    FAILED: 'bg-red-100 text-red-800'
};

const CreditCardHistory = ({ refreshKey }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [complaintFor, setComplaintFor] = useState(null); // the row being complained about
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [statusInfo, setStatusInfo] = useState(null); // complaint status popup
    const [checkingId, setCheckingId] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/credit-card/transactions');
            setRows(res.data?.data || []);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not load recent payments.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    const submitComplaint = async () => {
        if (!complaintFor || submitting) return;
        const text = description.trim();
        if (text.length < 10) {
            toast.error('Please describe the issue in at least 10 characters.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(`/credit-card/transactions/${complaintFor.id}/complaint`, {
                description: text
            });
            toast.success(`Complaint raised. Ticket ID: ${res.data?.data?.ticketId}`);
            setComplaintFor(null);
            setDescription('');
            load();
        } catch (error) {
            toast.error(errorMessage(error, 'Could not raise the complaint. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const checkStatus = async (row) => {
        try {
            setCheckingId(row.id);
            const res = await api.get(`/credit-card/transactions/${row.id}/complaint-status`);
            setStatusInfo(res.data?.data);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not fetch the complaint status.'));
        } finally {
            setCheckingId(null);
        }
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
                <button
                    onClick={load}
                    disabled={loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Date', 'Biller', 'Card', 'Card Holder', 'Bill Amount', 'Total Deducted', 'Status', 'Complaint'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                <td className="px-4 py-3">{r.billerName || '—'}</td>
                                <td className="px-4 py-3 font-mono">•••• {r.cardLast4}</td>
                                <td className="px-4 py-3">{r.customerName || '—'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMoney(r.billAmount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMoney(r.totalDeducted)}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {r.status}
                                    </span>
                                    {r.status !== 'SUCCESS' && r.message && (
                                        <p className="text-xs text-gray-500 mt-1 max-w-xs">{r.message}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {r.complaintTicketId ? (
                                        <div>
                                            <p className="text-xs font-mono">{r.complaintTicketId}</p>
                                            <button
                                                onClick={() => checkStatus(r)}
                                                disabled={checkingId === r.id}
                                                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                                            >
                                                {checkingId === r.id ? 'Checking...' : 'Check status'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setComplaintFor(r); setDescription(''); }}
                                            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            Raise complaint
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && rows.length === 0 && (
                <p className="text-center text-gray-500 py-8">No credit card bill payments yet.</p>
            )}

            {/* Raise complaint */}
            {complaintFor && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold mb-1">Raise a complaint</h3>
                        <p className="text-xs text-gray-500 mb-3">
                            {complaintFor.billerName} • card •••• {complaintFor.cardLast4} • {formatMoney(complaintFor.billAmount)}
                        </p>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                            rows={4}
                            placeholder="Describe the issue (for example: amount deducted but bill not paid)"
                            disabled={submitting}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-400 text-right">{description.length}/500</p>
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => setComplaintFor(null)}
                                disabled={submitting}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitComplaint}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaint status */}
            {statusInfo && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold mb-3">Complaint status</h3>
                        {[
                            ['Ticket ID', statusInfo.ticketId],
                            ['Status', statusInfo.status],
                            ['Type', statusInfo.type],
                            ['Service', statusInfo.serviceName],
                            ['Raised on', statusInfo.createdAt],
                            ['Description', statusInfo.description]
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-gray-100 text-sm">
                                <span className="text-gray-500">{label}</span>
                                <span className="font-medium text-gray-900 text-right">{value || '—'}</span>
                            </div>
                        ))}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setStatusInfo(null)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardHistory;
