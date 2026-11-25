import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../constants/API/axiosInstance';

// Admin dashboard: the Payout card and the Bill payment card (today, from 00:00 until now) and the
// "needs attention" strip for payments stuck pending. Data: GET /admin-dashboard/payments-today.
// Colors are written as plain values (not blue / indigo classes) so the page theme does not recolor them.

const REFRESH_MS = 60000;

const PALETTES = {
    teal: { strip: '#14b8a6', text: '#0f766e', tile: '#ccfbf1', tileText: '#115e59', bar: '#14b8a6' },
    blue: { strip: '#3b82f6', text: '#1d4ed8', tile: '#dbeafe', tileText: '#1e40af', bar: '#3b82f6' },
};
const FAILED = { tile: '#fee2e2', tileText: '#991b1b', bar: '#ef4444' };
const PENDING = { tile: '#fef3c7', tileText: '#92400e', bar: '#f59e0b' };

const inr = (value) =>
    '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const txns = (count) => `${count} ${count === 1 ? 'txn' : 'txns'}`;

const Tile = ({ label, bucket, colors }) => (
    <div className="rounded-lg p-2.5" style={{ backgroundColor: colors.tile, color: colors.tileText }}>
        <p className="text-xs">{label}</p>
        <p className="text-xl font-semibold leading-tight">{bucket?.count ?? 0}</p>
        <p className="text-[11px] opacity-85">{inr(bucket?.amount)}</p>
    </div>
);

const Bar = ({ summary, palette }) => {
    const success = summary?.success?.count ?? 0;
    const failed = summary?.failed?.count ?? 0;
    const pending = summary?.pending?.count ?? 0;
    const all = success + failed + pending;
    return (
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
            {all > 0 && (
                <>
                    <span style={{ width: `${(success * 100) / all}%`, backgroundColor: palette.bar }} />
                    <span style={{ width: `${(failed * 100) / all}%`, backgroundColor: FAILED.bar }} />
                    <span style={{ width: `${(pending * 100) / all}%`, backgroundColor: PENDING.bar }} />
                </>
            )}
        </div>
    );
};

const Line = ({ label, value }) => (
    <div className="flex justify-between gap-3 py-1.5 border-t border-slate-100 text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
);

const Change = ({ percent }) => {
    if (percent === null || percent === undefined) return null;
    const up = percent >= 0;
    return (
        <span className="ml-2 text-xs font-medium" style={{ color: up ? '#0f766e' : '#b91c1c' }}>
            {up ? '▲' : '▼'} {Math.abs(percent)}% vs yesterday
        </span>
    );
};

const SummaryCard = ({ title, subtitle, summary, palette, asOf, children }) => {
    const rate = summary?.successRate;
    const reason = summary?.topFailureReason;
    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 p-5"
            style={{ borderTopColor: palette.strip }}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
                <span className="text-[11px] rounded-full px-2 py-0.5 font-medium whitespace-nowrap"
                      style={{ backgroundColor: '#e6f3f0', color: '#0f766e' }}>
                    Today{asOf ? ` · till ${asOf}` : ''}
                </span>
            </div>

            <p className="mt-3 text-3xl font-bold" style={{ color: palette.text }}>
                {inr(summary?.success?.amount)}
                <Change percent={summary?.changePercent} />
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                <Tile label="Success" bucket={summary?.success} colors={palette} />
                <Tile label="Failed" bucket={summary?.failed} colors={FAILED} />
                <Tile label="Pending" bucket={summary?.pending} colors={PENDING} />
            </div>

            <Bar summary={summary} palette={palette} />
            <p className="text-xs text-slate-500 mt-1 mb-2">
                {rate === null || rate === undefined ? 'No payments yet today' : `Success rate ${rate}%`}
            </p>

            <Line label="Charges collected" value={inr(summary?.chargesCollected)} />
            {children}
            {reason && <Line label="Top failure reason" value={`${reason.reason} (${reason.count})`} />}
        </div>
    );
};

const PaymentsTodayCards = () => {
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const response = await api.get('/admin-dashboard/payments-today');
            setData(response.data);
            setFailed(false);
        } catch (err) {
            console.error('Today\'s payments fetch error:', err);
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    if (loading && !data) {
        return (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading today&apos;s payments...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center justify-between">
                <span>Could not load today&apos;s payments.</span>
                <button onClick={load} className="rounded-md border border-amber-300 px-3 py-1 hover:bg-amber-100">Retry</button>
            </div>
        );
    }

    const { payout, billPayment, stuckPendingMinutes } = data;
    const asOf = data.asOf
        ? new Date(data.asOf).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '';
    const stuckPayout = payout?.stuckPending || 0;
    const stuckBill = billPayment?.stuckPending || 0;
    const anyStuck = stuckPayout + stuckBill > 0;

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SummaryCard
                    title="Payout today"
                    subtitle="Money paid out successfully"
                    summary={payout}
                    palette={PALETTES.teal}
                    asOf={asOf}
                >
                    {(payout?.lines || []).map((vendor) => (
                        <Line
                            key={vendor.vendorId ?? vendor.name}
                            label={vendor.name}
                            value={`${txns(vendor.count)} · ${inr(vendor.amount)}`}
                        />
                    ))}
                </SummaryCard>

                <SummaryCard
                    title="Bill payment today"
                    subtitle="Bill Avenue and credit card (SuivrePay) together"
                    summary={billPayment}
                    palette={PALETTES.blue}
                    asOf={asOf}
                >
                    {(billPayment?.lines || []).map((channel) => (
                        <Line
                            key={channel.name}
                            label={channel.name}
                            value={`${txns(channel.count)} · ${inr(channel.amount)}`}
                        />
                    ))}
                </SummaryCard>
            </div>

            {anyStuck ? (
                <div className="mt-4 bg-white rounded-xl border border-red-200 border-l-4 px-4 py-3 flex items-center justify-between gap-3"
                     style={{ borderLeftColor: '#ef4444' }}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-slate-900">Needs attention</p>
                            <p className="text-sm text-red-800">
                                Pending for more than {stuckPendingMinutes} minutes: Payout {stuckPayout} · Bill payment {stuckBill}
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/others/update-transaction"
                        className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 whitespace-nowrap"
                    >
                        Open
                    </Link>
                </div>
            ) : (
                <div className="mt-4 bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5" style={{ color: '#0f766e' }} />
                    No payment has been pending for more than {stuckPendingMinutes} minutes.
                </div>
            )}

            {failed && (
                <p className="mt-2 text-xs text-amber-700">Could not refresh just now. Showing the last numbers.</p>
            )}
        </div>
    );
};

export default PaymentsTodayCards;
