import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import api from '../../constants/API/axiosInstance';

// Franchise-only "Push/Pull Wallet" (Credit/Debit Wallet). Credit moves money
// out of the franchise's own wallet into a merchant's wallet; Debit pulls it
// back. The backend resolves which franchise is calling from the logged-in
// session — nothing here needs (or should send) a franchise id.
const CreditDebitWallet = () => {
  const [profile, setProfile] = useState(null); // { franchiseName, walletBalance }
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [merchants, setMerchants] = useState([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [action, setAction] = useState('CREDIT'); // CREDIT | DEBIT
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');

  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedMerchant = merchants.find((m) => String(m.id) === String(selectedMerchantId)) || null;

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get('/franchise-wallet/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching franchise profile:', err);
      toast.error('Failed to load franchise profile');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchMerchants = useCallback(async () => {
    try {
      setLoadingMerchants(true);
      const res = await api.get('/franchise-wallet/merchants');
      setMerchants(res.data);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      toast.error('Failed to load merchants');
    } finally {
      setLoadingMerchants(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); fetchMerchants(); }, [fetchProfile, fetchMerchants]);

  const resetForm = () => {
    setAmount('');
    setAction('CREDIT');
    setRemark('');
  };

  const handleAmountChange = (e) => {
    // Digits and a single decimal point only.
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const openConfirm = () => {
    if (!selectedMerchant) {
      toast.error('Please select a merchant');
      return;
    }
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setConfirming(true);
  };

  const submitTransfer = async () => {
    setProcessing(true);
    try {
      await api.post(`/franchise-wallet/merchant/${selectedMerchant.id}/transfer`, {
        action,
        amount: Number(amount),
        remark: remark.trim() || undefined,
      });

      // Re-fetch from the server rather than trust a client-side merge —
      // this is the actual, authoritative post-transfer balance, and it's
      // the clearest possible signal to the user that the money actually
      // moved (both numbers visibly change on screen).
      await Promise.all([fetchProfile(), fetchMerchants()]);

      toast.success(`${action === 'CREDIT' ? 'Credited' : 'Debited'} ₹${Number(amount).toLocaleString('en-IN')} ${action === 'CREDIT' ? 'to' : 'from'} ${selectedMerchant.businessName}`);
      setConfirming(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
      setConfirming(false);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-indigo-600" />
            Credit / Debit Wallet
          </h1>
          <p className="text-gray-600 mt-1">
            {loadingProfile ? 'Loading…' : profile?.franchiseName}
          </p>
        </div>
        <button
          onClick={() => { fetchProfile(); fetchMerchants(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Franchise's own wallet balance */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">Your Wallet Balance</span>
        <span className="text-xl font-bold text-gray-900">
          {loadingProfile ? '—' : formatCurrency(profile?.walletBalance)}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        {/* Merchant select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Merchant *</label>
          <select
            value={selectedMerchantId}
            onChange={(e) => setSelectedMerchantId(e.target.value)}
            disabled={loadingMerchants}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{loadingMerchants ? 'Loading merchants…' : '-- Select Merchant --'}</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.businessName}</option>
            ))}
          </select>
        </div>

        {/* Merchant balance */}
        {selectedMerchant && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-indigo-700">{selectedMerchant.businessName}'s Wallet Balance</span>
            <span className="text-xl font-bold text-indigo-900">{formatCurrency(selectedMerchant.walletBalance)}</span>
          </div>
        )}

        {/* Credit / Debit toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Action *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction('CREDIT')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                action === 'CREDIT'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Credit
            </button>
            <button
              type="button"
              onClick={() => setAction('DEBIT')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                action === 'DEBIT'
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Debit
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Advance for the week"
            maxLength={255}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={openConfirm}
          className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${
            action === 'CREDIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {action === 'CREDIT' ? 'Credit' : 'Debit'} {amount ? `₹${Number(amount).toLocaleString('en-IN')}` : ''}
        </button>
      </div>

      {/* Confirmation modal */}
      {confirming && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Confirm {action === 'CREDIT' ? 'Credit' : 'Debit'}</h3>
            <p className="text-gray-600 text-sm mb-1">
              {action === 'CREDIT'
                ? <>You're about to credit <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> from your wallet to <strong>{selectedMerchant.businessName}</strong>'s wallet.</>
                : <>You're about to debit <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> from <strong>{selectedMerchant.businessName}</strong>'s wallet back into your wallet.</>}
            </p>
            <p className="text-gray-500 text-xs mb-4">{remark ? `Remark: ${remark}` : ' '}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={processing}
                className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                disabled={processing}
                className={`px-5 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  action === 'CREDIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDebitWallet;
