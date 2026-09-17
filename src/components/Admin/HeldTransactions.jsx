import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { Lock, ArrowLeft, RefreshCw, Unlock } from 'lucide-react';
import api from '../../constants/API/axiosInstance';

// Risk SOP Rule 1 (card velocity) — transactions held back from settlement
// because the same card was used more than the configured limit in a day.
// Releasing here is the only way that money ever reaches the merchant's
// wallet again, so this page exists purely for that one action.
const HeldTransactions = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [releasingId, setReleasingId] = useState(null); // internalId of row being released, or null
    const [releaseNotes, setReleaseNotes] = useState('');
    const [releasing, setReleasing] = useState(false);

    const fetchHeld = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/monitoring/held-transactions');
            setRows(res.data);
        } catch (err) {
            console.error('Error fetching held transactions:', err);
            toast.error('Failed to load held transactions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchHeld(); }, [fetchHeld]);

    const openRelease = (row) => {
        setReleasingId(row.internalId);
        setReleaseNotes('');
    };

    const submitRelease = async () => {
        setReleasing(true);
        try {
            await api.put(`/monitoring/held-transactions/${releasingId}/release`, { notes: releaseNotes });
            toast.success('Hold released — this transaction is eligible for settlement again');
            setReleasingId(null);
            fetchHeld();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to release hold');
        } finally {
            setReleasing(false);
        }
    };

    const maskedCard = (row) => (row.paymentCardBin && row.cardLastFourDigit)
        ? `${row.paymentCardBin}••••••${row.cardLastFourDigit}`
        : '—';

    return (
        <div className="max-w-9xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/dashboard/monitoring" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="w-7 h-7 text-indigo-600" />
                        Held Transactions
                    </h1>
                    <p className="text-gray-600 mt-1">Transactions withheld from settlement pending manual risk review. Release a hold only after confirming the transaction is legitimate.</p>
                </div>
                <button
                    onClick={fetchHeld}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                ) : rows.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Nothing on hold right now.</div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-500">
                                <th className="py-2.5 px-4">Txn Ref ID</th>
                                <th className="py-2.5 px-4">MID / TID</th>
                                <th className="py-2.5 px-4">Card</th>
                                <th className="py-2.5 px-4">Amount</th>
                                <th className="py-2.5 px-4">Date</th>
                                <th className="py-2.5 px-4">Hold Reason</th>
                                <th className="py-2.5 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.internalId} className="border-t border-gray-100">
                                    <td className="py-2.5 px-4 font-mono text-xs text-gray-700">{row.transactionReferenceId}</td>
                                    <td className="py-2.5 px-4 text-gray-600">{row.mid} / {row.tid}</td>
                                    <td className="py-2.5 px-4 font-mono text-xs text-gray-600">{maskedCard(row)}</td>
                                    <td className="py-2.5 px-4 text-gray-800 font-medium">₹{Number(row.amount ?? 0).toFixed(2)}</td>
                                    <td className="py-2.5 px-4 text-gray-500">{row.date ? new Date(row.date).toLocaleString() : '—'}</td>
                                    <td className="py-2.5 px-4 text-gray-500">{row.riskHoldReason || '—'}</td>
                                    <td className="py-2.5 px-4">
                                        <button
                                            onClick={() => openRelease(row)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 text-white text-xs font-bold rounded-full hover:bg-indigo-800 transition-colors"
                                        >
                                            <Unlock className="w-3 h-3" /> Release Hold
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Release confirmation modal */}
            {releasingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            <Unlock className="w-5 h-5 text-indigo-600" />
                            Release Hold
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            This transaction will become eligible for settlement again the next time a batch runs.
                            Only release after you've confirmed this is not fraud.
                        </p>
                        <textarea
                            value={releaseNotes}
                            onChange={(e) => setReleaseNotes(e.target.value)}
                            rows={4}
                            placeholder="e.g. Called merchant, confirmed genuine repeat customer purchases."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setReleasingId(null)}
                                disabled={releasing}
                                className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRelease}
                                disabled={releasing}
                                className="px-5 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors disabled:opacity-50"
                            >
                                {releasing ? 'Releasing…' : 'Confirm Release'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeldTransactions;
