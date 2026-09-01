import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { AlertTriangle, ArrowLeft, Plus, Pencil, RefreshCw } from 'lucide-react';
import api from '../../constants/API/axiosInstance';

const SEVERITY_STYLES = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
};

const SOURCE_TYPES = ['PAYOUT', 'PAYOUT_REFUND', 'BBPS', 'BBPS_REFUND', 'SETTLEMENT', 'COMMISSION', 'WALLET_ADJUSTMENT'];

// Which parameter fields a rule form should show, per rule type — mirrors
// exactly what RuleEvaluationService reads out of MonitoringRule.parameters.
const RULE_TYPE_PARAM_FIELDS = {
    AMOUNT_THRESHOLD: [{ key: 'minAmount', label: 'Minimum Amount (₹)', placeholder: 'e.g. 100000' }],
    VELOCITY: [
        { key: 'windowMinutes', label: 'Window (minutes)', placeholder: 'e.g. 60' },
        { key: 'maxCount', label: 'Max Transactions Allowed', placeholder: 'e.g. 5' },
    ],
    FAILURE_RATE: [
        { key: 'windowMinutes', label: 'Window (minutes)', placeholder: 'e.g. 60' },
        { key: 'maxFailures', label: 'Max Failures Allowed', placeholder: 'e.g. 3' },
    ],
    STUCK_PENDING: [{ key: 'stuckMinutes', label: 'Stuck After (minutes)', placeholder: 'e.g. 30' }],
};

const EMPTY_RULE_FORM = {
    name: '',
    description: '',
    ruleType: 'AMOUNT_THRESHOLD',
    sourceType: '',
    severity: 'MEDIUM',
    active: true,
    params: {},
};

const parseParams = (parametersJson) => {
    try {
        return JSON.parse(parametersJson || '{}');
    } catch {
        return {};
    }
};

const SeverityBadge = ({ severity }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {severity}
    </span>
);

const MonitoringRules = () => {
    const [rules, setRules] = useState([]);
    const [loadingRules, setLoadingRules] = useState(true);

    const [ruleForm, setRuleForm] = useState(null); // null = closed; EMPTY_RULE_FORM-shaped object = open
    const [editingRuleId, setEditingRuleId] = useState(null); // null = creating new
    const [savingRule, setSavingRule] = useState(false);

    const fetchRules = useCallback(async () => {
        try {
            setLoadingRules(true);
            const res = await api.get('/monitoring/rules');
            setRules(res.data);
        } catch (err) {
            console.error('Error fetching rules:', err);
            toast.error('Failed to load rules');
        } finally {
            setLoadingRules(false);
        }
    }, []);

    useEffect(() => { fetchRules(); }, [fetchRules]);

    const toggleRuleActive = async (rule) => {
        try {
            await api.put(`/monitoring/rules/${rule.id}/active`, null, { params: { active: !rule.active } });
            toast.success(`Rule ${rule.active ? 'deactivated' : 'activated'}`);
            fetchRules();
        } catch {
            toast.error('Failed to update rule');
        }
    };

    const openCreateRule = () => {
        setEditingRuleId(null);
        setRuleForm({ ...EMPTY_RULE_FORM, params: {} });
    };

    const openEditRule = (rule) => {
        setEditingRuleId(rule.id);
        setRuleForm({
            name: rule.name || '',
            description: rule.description || '',
            ruleType: rule.ruleType,
            sourceType: rule.sourceType || '',
            severity: rule.severity,
            active: rule.active,
            params: parseParams(rule.parameters),
        });
    };

    const closeRuleForm = () => {
        setRuleForm(null);
        setEditingRuleId(null);
    };

    const setRuleFormField = (field, value) => {
        setRuleForm((f) => ({ ...f, [field]: value }));
    };

    const setRuleParamField = (key, value) => {
        setRuleForm((f) => ({ ...f, params: { ...f.params, [key]: value } }));
    };

    const submitRuleForm = async () => {
        if (!ruleForm.name.trim()) {
            toast.error('Rule name is required');
            return;
        }

        const paramFields = RULE_TYPE_PARAM_FIELDS[ruleForm.ruleType] || [];
        const paramsPayload = {};
        for (const field of paramFields) {
            const raw = ruleForm.params[field.key];
            if (raw === undefined || raw === '' || raw === null) {
                toast.error(`${field.label} is required`);
                return;
            }
            paramsPayload[field.key] = Number(raw);
        }

        const payload = {
            name: ruleForm.name.trim(),
            description: ruleForm.description.trim(),
            ruleType: ruleForm.ruleType,
            sourceType: ruleForm.sourceType || null,
            severity: ruleForm.severity,
            active: ruleForm.active,
            parameters: JSON.stringify(paramsPayload),
        };

        setSavingRule(true);
        try {
            if (editingRuleId) {
                await api.put(`/monitoring/rules/${editingRuleId}`, payload);
                toast.success('Rule updated');
            } else {
                await api.post('/monitoring/rules', payload);
                toast.success('Rule created');
            }
            closeRuleForm();
            fetchRules();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save rule');
        } finally {
            setSavingRule(false);
        }
    };

    return (
        <div className="max-w-9xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/dashboard/monitoring" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-indigo-600" />
                        Monitoring Rules
                    </h1>
                    <p className="text-gray-600 mt-1">Define what the Transaction Monitoring rules engine watches for and how severely to flag it</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRules}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                        onClick={openCreateRule}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-lg hover:bg-indigo-800"
                    >
                        <Plus className="w-4 h-4" /> New Rule
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                {loadingRules ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading rules…</div>
                ) : rules.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No rules configured yet.</div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-500">
                                <th className="py-2.5 px-4">Name</th>
                                <th className="py-2.5 px-4">Type</th>
                                <th className="py-2.5 px-4">Source</th>
                                <th className="py-2.5 px-4">Parameters</th>
                                <th className="py-2.5 px-4">Severity</th>
                                <th className="py-2.5 px-4">Active</th>
                                <th className="py-2.5 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id} className="border-t border-gray-100">
                                    <td className="py-2.5 px-4">
                                        <div className="font-medium text-gray-800">{rule.name}</div>
                                        <div className="text-xs text-gray-400">{rule.description}</div>
                                    </td>
                                    <td className="py-2.5 px-4 text-gray-600">{rule.ruleType}</td>
                                    <td className="py-2.5 px-4 text-gray-600">{rule.sourceType || 'All'}</td>
                                    <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{rule.parameters}</td>
                                    <td className="py-2.5 px-4"><SeverityBadge severity={rule.severity} /></td>
                                    <td className="py-2.5 px-4">
                                        <button
                                            onClick={() => toggleRuleActive(rule)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full ${rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            {rule.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <button
                                            onClick={() => openEditRule(rule)}
                                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                                            title="Edit rule"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Rule create/edit modal */}
            {ruleForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingRuleId ? 'Edit Rule' : 'New Monitoring Rule'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={ruleForm.name}
                                    onChange={(e) => setRuleFormField('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Large Settlement Payout"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    value={ruleForm.description}
                                    onChange={(e) => setRuleFormField('description', e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rule Type *</label>
                                    <select
                                        value={ruleForm.ruleType}
                                        onChange={(e) => setRuleFormField('ruleType', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="AMOUNT_THRESHOLD">Amount Threshold</option>
                                        <option value="VELOCITY">Velocity</option>
                                        <option value="FAILURE_RATE">Failure Rate</option>
                                        <option value="STUCK_PENDING">Stuck Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity *</label>
                                    <select
                                        value={ruleForm.severity}
                                        onChange={(e) => setRuleFormField('severity', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Applies To</label>
                                <select
                                    value={ruleForm.sourceType}
                                    onChange={(e) => setRuleFormField('sourceType', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Sources</option>
                                    {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {(RULE_TYPE_PARAM_FIELDS[ruleForm.ruleType] || []).map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label} *</label>
                                        <input
                                            type="number"
                                            value={ruleForm.params[field.key] ?? ''}
                                            onChange={(e) => setRuleParamField(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={ruleForm.active}
                                    onChange={(e) => setRuleFormField('active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                Active
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeRuleForm}
                                disabled={savingRule}
                                className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRuleForm}
                                disabled={savingRule}
                                className="px-5 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors disabled:opacity-50"
                            >
                                {savingRule ? 'Saving…' : editingRuleId ? 'Save Changes' : 'Create Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonitoringRules;
