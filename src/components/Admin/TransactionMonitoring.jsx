import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Download,
    Search,
} from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import { notifyAlertsChanged } from './monitoringEvents';

const SEVERITY_STYLES = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
};

const STATUS_STYLES = {
    OPEN: 'bg-red-100 text-red-700',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
    FALSE_POSITIVE: 'bg-gray-100 text-gray-600',
    // System-closed (e.g. a late payout callback resolved a Stuck-Pending
    // alert on its own) — kept visually distinct from a human's RESOLVED so
    // it's clear at a glance which closures were reviewed vs. automatic.
    AUTO_RESOLVED: 'bg-teal-100 text-teal-700',
};

const SeverityBadge = ({ severity }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {severity}
    </span>
);

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
        {status?.replace('_', ' ')}
    </span>
);

const TransactionMonitoring = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const [alerts, setAlerts] = useState({ content: [], totalElements: 0, totalPages: 0 });
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [statusFilter, setStatusFilter] = useState('OPEN');
    const [severityFilter, setSeverityFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [merchantSearchInput, setMerchantSearchInput] = useState('');
    const [merchantSearch, setMerchantSearch] = useState(''); // debounced value that actually triggers a fetch
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [exporting, setExporting] = useState(false);

    // Debounce the merchant/franchise name search so it doesn't fire a
    // request on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => {
            setMerchantSearch(merchantSearchInput);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [merchantSearchInput]);

    const [resolvingId, setResolvingId] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolutionAction, setResolutionAction] = useState(null); // 'resolve' | 'false-positive'

    const fetchDashboard = useCallback(async () => {
        try {
            setLoadingDashboard(true);
            const res = await api.get('/monitoring/dashboard');
            setDashboard(res.data);
        } catch (err) {
            console.error('Error fetching monitoring dashboard:', err);
            toast.error('Failed to load monitoring dashboard');
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            setLoadingAlerts(true);
            const params = { page, size: pageSize };
            if (statusFilter) params.status = statusFilter;
            if (severityFilter) params.severity = severityFilter;
            if (fromDate) params.startDate = `${fromDate}T00:00:00`;
            if (toDate) params.endDate = `${toDate}T23:59:59`;
            if (merchantSearch) params.merchant = merchantSearch;
            const res = await api.get('/monitoring/alerts', { params });
            setAlerts(res.data);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            toast.error('Failed to load alerts');
        } finally {
            setLoadingAlerts(false);
        }
    }, [page, pageSize, statusFilter, severityFilter, fromDate, toDate, merchantSearch]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
    useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

    const refreshAll = () => {
        fetchDashboard();
        fetchAlerts();
    };

    const acknowledge = async (id) => {
        try {
            await api.put(`/monitoring/alerts/${id}/acknowledge`);
            toast.success('Alert acknowledged');
            fetchAlerts();
            fetchDashboard();
            notifyAlertsChanged();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to acknowledge alert');
        }
    };

    const openResolutionBox = (id, action) => {
        setResolvingId(id);
        setResolutionAction(action);
        setResolutionNotes('');
    };

    const submitResolution = async () => {
        if (!resolvingId) return;
        try {
            const endpoint = resolutionAction === 'false-positive' ? 'false-positive' : 'resolve';
            await api.put(`/monitoring/alerts/${resolvingId}/${endpoint}`, { notes: resolutionNotes });
            toast.success(resolutionAction === 'false-positive' ? 'Marked as false positive' : 'Alert resolved');
            setResolvingId(null);
            setResolutionNotes('');
            fetchAlerts();
            fetchDashboard();
            notifyAlertsChanged();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update alert');
        }
    };

    // ── CSV export ───────────────────────────────────────────────────────────
    const exportAlerts = async () => {
        setExporting(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (severityFilter) params.severity = severityFilter;
            if (fromDate) params.startDate = `${fromDate}T00:00:00`;
            if (toDate) params.endDate = `${toDate}T23:59:59`;
            if (merchantSearch) params.merchant = merchantSearch;

            const res = await api.get('/monitoring/alerts/export', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transaction-monitoring-alerts.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to export alerts');
        } finally {
            setExporting(false);
        }
    };

    const severityCounts = dashboard?.openAlertsBySeverity || {};
    const statusCounts = dashboard?.last24hBySourceAndStatus || {};
    const cardBrandBreakdown = dashboard?.last24hByCardBrand || [];

    return (
        <div className="max-w-9xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <ShieldAlert className="w-7 h-7 text-indigo-600" />
                        Transaction Monitoring
                    </h1>
                    <p className="text-gray-600 mt-1">Fraud alerts, stuck transactions, and cross-rail transaction health</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to="/dashboard/monitoring/rules"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <AlertTriangle className="w-4 h-4" /> Manage Rules
                    </Link>
                    <button
                        onClick={refreshAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Severity summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Open Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{loadingDashboard ? '—' : dashboard?.openAlertsTotal ?? 0}</p>
                </div>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                    <div key={sev} className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">{sev}</p>
                        <p className="text-2xl font-bold text-gray-900">{loadingDashboard ? '—' : severityCounts[sev] ?? 0}</p>
                    </div>
                ))}
            </div>

            {/* Last 24h status by source */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-700 mb-3">Last 24 Hours — Transactions by Source</h2>
                {loadingDashboard ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : Object.keys(statusCounts).length === 0 ? (
                    <p className="text-sm text-gray-400">No transaction activity in the last 24 hours.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                    <th className="py-2 pr-4">Source</th>
                                    <th className="py-2 pr-4">Success</th>
                                    <th className="py-2 pr-4">Pending</th>
                                    <th className="py-2 pr-4">Failed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(statusCounts).map(([source, counts]) => (
                                    <tr key={source} className="border-b border-gray-50">
                                        <td className="py-2 pr-4 font-medium text-gray-800">{source}</td>
                                        <td className="py-2 pr-4 text-green-700">{counts.SUCCESS ?? 0}</td>
                                        <td className="py-2 pr-4 text-yellow-700">{counts.PENDING ?? 0}</td>
                                        <td className="py-2 pr-4 text-red-700">{counts.FAILED ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Last 24h card network breakdown — only settlement/commission events
                that came from a card-present transaction carry a card brand. */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-700 mb-3">Last 24 Hours — Card Network Volume</h2>
                {loadingDashboard ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : !cardBrandBreakdown || cardBrandBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400">No card-settled transactions in the last 24 hours.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cardBrandBreakdown.map((row) => (
                            <div key={row.cardBrand} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500">{row.cardBrand}</p>
                                <p className="text-lg font-bold text-gray-900">{row.count} txns</p>
                                <p className="text-xs text-gray-600">₹{Number(row.amount ?? 0).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3 justify-between">
                    <h2 className="text-sm font-bold text-gray-700">Alerts</h2>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="ACKNOWLEDGED">Acknowledged</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="AUTO_RESOLVED">Auto-Resolved</option>
                            <option value="FALSE_POSITIVE">False Positive</option>
                        </select>
                        <select
                            value={severityFilter}
                            onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Severity</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={merchantSearchInput}
                                onChange={(e) => setMerchantSearchInput(e.target.value)}
                                placeholder="Search merchant/franchise..."
                                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                            />
                        </div>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            title="From date"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            title="To date"
                        />
                        {(fromDate || toDate || merchantSearchInput) && (
                            <button
                                onClick={() => { setFromDate(''); setToDate(''); setMerchantSearchInput(''); setPage(0); }}
                                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear filters
                            </button>
                        )}
                        <button
                            onClick={exportAlerts}
                            disabled={exporting}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
                        </button>
                    </div>
                </div>

                {loadingAlerts ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading alerts…</div>
                ) : alerts.content.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        No alerts match this filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-500">
                                    <th className="py-2.5 px-4">Severity</th>
                                    <th className="py-2.5 px-4">Source</th>
                                    <th className="py-2.5 px-4">Initiator</th>
                                    <th className="py-2.5 px-4">Amount</th>
                                    <th className="py-2.5 px-4">Message</th>
                                    <th className="py-2.5 px-4">Status</th>
                                    <th className="py-2.5 px-4">Raised</th>
                                    <th className="py-2.5 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.content.map((alert) => (
                                    <tr key={alert.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-2.5 px-4"><SeverityBadge severity={alert.severity} /></td>
                                        <td className="py-2.5 px-4 text-gray-700">{alert.sourceType}</td>
                                        <td className="py-2.5 px-4 text-gray-700">
                                            {alert.initiatorName ? (
                                                <>
                                                    <div className="font-medium">{alert.initiatorName}</div>
                                                    <div className="text-xs text-gray-400">{alert.initiatorType} #{alert.initiatorId}</div>
                                                </>
                                            ) : (
                                                <span>{alert.initiatorType} #{alert.initiatorId}</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4 text-gray-700">{alert.amount != null ? `₹${Number(alert.amount).toLocaleString('en-IN')}` : '—'}</td>
                                        <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate" title={alert.message}>{alert.message}</td>
                                        <td className="py-2.5 px-4"><StatusBadge status={alert.status} /></td>
                                        <td className="py-2.5 px-4 text-gray-500 text-xs">{alert.createdAt ? new Date(alert.createdAt).toLocaleString('en-IN') : '—'}</td>
                                        <td className="py-2.5 px-4">
                                            {alert.status === 'OPEN' && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => acknowledge(alert.id)}
                                                        className="px-2.5 py-1 text-xs font-medium text-yellow-700 border border-yellow-300 rounded-md hover:bg-yellow-50"
                                                    >
                                                        Ack
                                                    </button>
                                                    <button
                                                        onClick={() => openResolutionBox(alert.id, 'resolve')}
                                                        className="px-2.5 py-1 text-xs font-medium text-green-700 border border-green-300 rounded-md hover:bg-green-50"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => openResolutionBox(alert.id, 'false-positive')}
                                                        className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        False+
                                                    </button>
                                                </div>
                                            )}
                                            {alert.status === 'ACKNOWLEDGED' && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => openResolutionBox(alert.id, 'resolve')}
                                                        className="px-2.5 py-1 text-xs font-medium text-green-700 border border-green-300 rounded-md hover:bg-green-50"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => openResolutionBox(alert.id, 'false-positive')}
                                                        className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        False+
                                                    </button>
                                                </div>
                                            )}
                                            {['RESOLVED', 'FALSE_POSITIVE', 'AUTO_RESOLVED'].includes(alert.status) && alert.resolutionNotes && (
                                                <span className="text-xs text-gray-400 italic" title={alert.resolutionNotes}>
                                                    {alert.status === 'AUTO_RESOLVED' ? 'auto-closed' : 'note added'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {alerts.content.length > 0 && (
                    <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span>Rows per page</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>Page {page + 1} of {Math.max(alerts.totalPages, 1)} ({alerts.totalElements} total)</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(alerts.totalPages - 1, p + 1))}
                                disabled={page >= alerts.totalPages - 1}
                                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Resolution modal */}
            {resolvingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            {resolutionAction === 'false-positive' ? <XCircle className="w-5 h-5 text-gray-500" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
                            {resolutionAction === 'false-positive' ? 'Mark as False Positive' : 'Resolve Alert'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">Add a note explaining what was found and any action taken (optional, but recommended for the audit trail).</p>
                        <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={4}
                            placeholder="e.g. Confirmed with merchant, legitimate bulk payout for vendor settlement."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setResolvingId(null)}
                                className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitResolution}
                                className="px-5 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionMonitoring;
