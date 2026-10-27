import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';
import { notifyWalletBalanceChanged } from '../layout/walletEvents';
import CreditCardHistory from './CreditCardHistory';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const formatMoney = (v) =>
    `₹${Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const errorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || fallback;

const Row = ({ label, value }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
);

const Spinner = ({ className = 'h-5 w-5' }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);

const CreditCardBillPage = () => {
    const [billers, setBillers] = useState([]);
    const [loadingBillers, setLoadingBillers] = useState(true);
    const [billersError, setBillersError] = useState('');

    const [selectedBiller, setSelectedBiller] = useState(null);
    const [cardLast4, setCardLast4] = useState('');
    const [mobile, setMobile] = useState('');
    const [fetching, setFetching] = useState(false);

    const [bill, setBill] = useState(null);
    const [pan, setPan] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [paying, setPaying] = useState(false);

    const [result, setResult] = useState(null); // { status, message, data }
    const [historyKey, setHistoryKey] = useState(0);
    const payingRef = useRef(false);

    useEffect(() => {
        const loadBillers = async () => {
            try {
                setLoadingBillers(true);
                setBillersError('');
                const res = await api.get('/credit-card/billers');
                setBillers(res.data?.data || []);
            } catch (error) {
                setBillersError(errorMessage(error, 'Could not load credit card billers.'));
            } finally {
                setLoadingBillers(false);
            }
        };
        loadBillers();
    }, []);

    const resetBill = () => {
        setBill(null);
        setPan('');
        setConfirming(false);
    };

    const handleBillerChange = (option) => {
        setSelectedBiller(option);
        setResult(null);
        resetBill();
    };

    const canFetch = selectedBiller && cardLast4.length === 4 && mobile.length === 10 && !fetching;

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!canFetch) return;

        try {
            setFetching(true);
            setResult(null);
            resetBill();
            const res = await api.post('/credit-card/fetch-bill', {
                billerId: selectedBiller.value,
                cardLast4,
                mobileNumber: mobile
            });
            setBill(res.data?.data);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not fetch the bill. Please try again.'));
        } finally {
            setFetching(false);
        }
    };

    const panValid = !pan || PAN_REGEX.test(pan);
    const panOk = bill?.panRequired ? PAN_REGEX.test(pan) : panValid;

    const handlePay = async () => {
        // The ref blocks a second click in the same instant (state updates are async);
        // the server also refuses to pay the same bill, or the same amount to the
        // same card within 2 minutes, twice.
        if (!bill || paying || !panOk || payingRef.current) return;
        payingRef.current = true;

        let finished = false; // true once the server gave a payment result
        try {
            setPaying(true);
            const res = await api.post('/credit-card/pay', {
                requestId: bill.requestId,
                customerPan: pan || null
            });
            setResult(res.data); // SUCCESS or PENDING
            finished = true;
        } catch (error) {
            const data = error?.response?.data;
            if (data?.status === 'FAILED') {
                setResult(data); // definite failure, money already refunded
                finished = true;
            } else {
                // Rejected before any money moved (for example "same amount paid a moment
                // ago"), or the network dropped. Keep the bill on screen so it can be retried.
                toast.error(errorMessage(error, 'Payment could not be completed. Please check Recent Payments.'), { autoClose: 8000 });
            }
        } finally {
            setPaying(false);
            setConfirming(false);
            if (finished) {
                resetBill();
                setCardLast4('');
                setMobile('');
            }
            notifyWalletBalanceChanged();
            setHistoryKey((k) => k + 1);
            payingRef.current = false;
        }
    };

    const resultStyle = {
        SUCCESS: 'bg-green-50 border-green-300 text-green-800',
        PENDING: 'bg-amber-50 border-amber-300 text-amber-800',
        FAILED: 'bg-red-50 border-red-300 text-red-800'
    };
    const resultTitle = {
        SUCCESS: 'Payment successful',
        PENDING: 'Payment is being confirmed',
        FAILED: 'Payment failed'
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-1">Credit Card Bill Payment</h1>
            <p className="text-sm text-gray-500 mb-6">
                Select the card issuer, enter the last 4 digits of the card and the registered mobile number to fetch the bill.
                Full card numbers are never asked for or stored.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Step 1: biller + card details */}
                <form onSubmit={handleFetch} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold text-gray-800">1. Find the bill</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Card Biller *</label>
                        <Select
                            options={billers.map((b) => ({ value: b.billerId, label: b.billerName }))}
                            value={selectedBiller}
                            onChange={handleBillerChange}
                            isLoading={loadingBillers}
                            placeholder={loadingBillers ? 'Loading billers...' : 'Search or select biller...'}
                            className="text-sm"
                            isDisabled={fetching || paying}
                        />
                        {billersError && (
                            <div className="mt-2 bg-amber-50 border border-amber-300 rounded p-3 text-sm text-amber-900">
                                {billersError}
                            </div>
                        )}
                    </div>

                    {selectedBiller && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last 4 digits of Primary Credit Card Number *
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={cardLast4}
                                    maxLength={4}
                                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="e.g. 3044"
                                    disabled={fetching || paying}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Registered Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={mobile}
                                    maxLength={10}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit mobile registered with the bank"
                                    disabled={fetching || paying}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!canFetch}
                                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {fetching && <Spinner className="h-4 w-4" />}
                                {fetching ? 'Fetching bill...' : 'Fetch Bill'}
                            </button>
                        </>
                    )}
                </form>

                {/* Step 2: bill + pay, or the result */}
                <div className="space-y-4">
                    {fetching && (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-blue-500">
                            <Spinner className="h-10 w-10" />
                            <p className="mt-3 text-sm font-medium text-gray-700">Fetching your bill from the bank...</p>
                            <p className="text-xs text-gray-500 mt-1">This can take a few seconds. Please do not close or refresh the page.</p>
                        </div>
                    )}

                    {result && (
                        <div className={`border rounded-lg p-4 ${resultStyle[result.status] || resultStyle.PENDING}`}>
                            <p className="font-semibold">{resultTitle[result.status] || 'Payment status'}</p>
                            <p className="text-sm mt-1">{result.message}</p>
                            {result.data?.walletTxnId && (
                                <p className="text-xs mt-2 font-mono">Transaction ID: {result.data.walletTxnId}</p>
                            )}
                            {result.data?.totalDeducted != null && result.status !== 'FAILED' && (
                                <p className="text-xs mt-1">Deducted from wallet: {formatMoney(result.data.totalDeducted)}</p>
                            )}
                            {result.status === 'FAILED' && (
                                <p className="text-xs mt-1">No amount has been deducted from your wallet.</p>
                            )}
                        </div>
                    )}

                    {bill && (
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h2 className="font-semibold text-gray-800 mb-3">2. Review and pay</h2>

                            <Row label="Biller" value={bill.billerName} />
                            <Row label="Card holder" value={bill.customerName} />
                            <Row label="Bill number" value={bill.billNumber} />
                            <Row label="Bill date" value={bill.billDate} />
                            <Row label="Due date" value={bill.dueDate} />
                            <Row label="Bill amount" value={formatMoney(bill.billAmount)} />
                            <Row label="Service charges" value={formatMoney(bill.charges)} />
                            <div className="flex justify-between py-2 text-base">
                                <span className="font-semibold text-gray-800">Total from your wallet</span>
                                <span className="font-bold text-gray-900">{formatMoney(bill.totalPayable)}</span>
                            </div>

                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer PAN {bill.panRequired ? '*' : '(optional)'}
                                </label>
                                <input
                                    type="text"
                                    value={pan}
                                    maxLength={10}
                                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                                    placeholder="ABCDE1234F"
                                    disabled={paying}
                                    className={`w-full p-2 border rounded font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent ${pan && !panValid ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {bill.panRequired && (
                                    <p className="text-xs text-gray-500 mt-1">PAN is mandatory for payments of ₹50,000 or more.</p>
                                )}
                                {pan && !panValid && <p className="text-xs text-red-500 mt-1">Enter a valid PAN (5 letters, 4 digits, 1 letter).</p>}
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                This bill stays valid for 30 minutes. If it expires, fetch it again.
                            </p>

                            {!confirming ? (
                                <button
                                    onClick={() => setConfirming(true)}
                                    disabled={paying || !panOk}
                                    className="mt-4 w-full bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                                >
                                    Pay {formatMoney(bill.totalPayable)}
                                </button>
                            ) : (
                                <div className="mt-4 border border-amber-300 bg-amber-50 rounded p-3">
                                    <p className="text-sm text-amber-900 font-medium">
                                        {formatMoney(bill.totalPayable)} will be deducted from your wallet to pay this bill. This cannot be undone. Continue?
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handlePay}
                                            disabled={paying}
                                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 disabled:bg-green-300"
                                        >
                                            {paying && <Spinner className="h-4 w-4" />}
                                            {paying ? 'Processing...' : 'Yes, pay now'}
                                        </button>
                                        <button
                                            onClick={() => setConfirming(false)}
                                            disabled={paying}
                                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-medium hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreditCardHistory refreshKey={historyKey} />
        </div>
    );
};

export default CreditCardBillPage;
