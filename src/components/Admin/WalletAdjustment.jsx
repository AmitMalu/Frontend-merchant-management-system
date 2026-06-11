// import { useState, useEffect } from 'react';
// import api from '../../constants/API/axiosInstance';

// const WalletAdjustment = () => {
//     const [customerType, setCustomerType] = useState('');
//     const [franchises, setFranchises] = useState([]);
//     const [directMerchants, setDirectMerchants] = useState([]);
//     const [franchiseMerchants, setFranchiseMerchants] = useState([]);

//     const [selectedFranchise, setSelectedFranchise] = useState('');
//     const [selectedMerchant, setSelectedMerchant] = useState('');
//     const [selectedFranchiseForMerchant, setSelectedFranchiseForMerchant] = useState('');

//     const [walletInfo, setWalletInfo] = useState(null);
//     const [showModal, setShowModal] = useState(false);

//     const [formData, setFormData] = useState({
//         type: 'CREDIT',
//         amount: '',
//         remark: ''
//     });

//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (customerType) {
//             fetchData();
//         }
//     }, [customerType]);

//     useEffect(() => {
//         if (customerType === 'franchise-merchant' && selectedFranchiseForMerchant) {
//             fetchFranchiseMerchants();
//         }
//     }, [selectedFranchiseForMerchant]);

//     const fetchData = async () => {
//         try {
//             if (customerType === 'franchise') {
//                 const res = await api.get('/franchise');
//                 setFranchises(res.data);
//             } else if (customerType === 'direct-merchant') {
//                 const res = await api.get('/merchants/direct-merchant');
//                 setDirectMerchants(res.data);
//             } else if (customerType === 'franchise-merchant') {
//                 const res = await api.get('/franchise');
//                 setFranchises(res.data);
//             }
//         } catch (err) {
//             console.error('Error fetching data:', err);
//         }
//     };

//     const fetchFranchiseMerchants = async () => {
//         try {
//             const res = await api.get('/merchants/franchise-merchant');
//             const filtered = res.data.filter(m => m.franchiseId === parseInt(selectedFranchiseForMerchant));
//             setFranchiseMerchants(filtered);
//         } catch (err) {
//             console.error('Error fetching franchise merchants:', err);
//         }
//     };

//     const fetchWallet = async () => {
//         try {
//             let id, name, balance;

//             if (customerType === 'franchise') {
//                 const franchise = franchises.find(f => f.id === parseInt(selectedFranchise));
//                 if (franchise) {
//                     id = franchise.id;
//                     name = franchise.franchiseName;
//                     balance = franchise.walletBalance;
//                 }
//             } else if (customerType === 'direct-merchant') {
//                 const merchant = directMerchants.find(m => m.id === parseInt(selectedMerchant));
//                 if (merchant) {
//                     id = merchant.id;
//                     name = merchant.businessName;
//                     balance = merchant.walletBalance;
//                 }
//             } else if (customerType === 'franchise-merchant') {
//                 const merchant = franchiseMerchants.find(m => m.id === parseInt(selectedMerchant));
//                 if (merchant) {
//                     id = merchant.id;
//                     name = merchant.businessName;
//                     balance = merchant.walletBalance;
//                 }
//             }

//             setWalletInfo({ id, name, balance });
//         } catch (err) {
//             console.error('Error fetching wallet:', err);
//         }
//     };

//     useEffect(() => {
//         if (customerType === 'franchise' && selectedFranchise) {
//             fetchWallet();
//         } else if (customerType === 'direct-merchant' && selectedMerchant) {
//             fetchWallet();
//         } else if (customerType === 'franchise-merchant' && selectedMerchant) {
//             fetchWallet();
//         } else {
//             setWalletInfo(null);
//         }
//     }, [selectedFranchise, selectedMerchant, customerType]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const payload = {
//                 customerId: walletInfo.id,
//                 actionOnBalance: formData.type,
//                 amount: parseFloat(formData.amount),
//                 remark: formData.remark
//             };

//             const endpoint = customerType === 'franchise'
//                 ? '/wallet-adjustment/franchise'
//                 : '/wallet-adjustment/merchant';

//             await api.post(endpoint, payload);

//             alert('Wallet adjustment successful');
//             setShowModal(false);
//             setFormData({ type: 'CREDIT', amount: '', remark: '' });
//             fetchWallet();
//             fetchData();
//         } catch (err) {
//             console.error('Error adjusting wallet:', err);
//             alert('Failed to adjust wallet');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetSelections = () => {
//         setSelectedFranchise('');
//         setSelectedMerchant('');
//         setSelectedFranchiseForMerchant('');
//         setWalletInfo(null);
//         setFranchises([]);
//         setDirectMerchants([]);
//         setFranchiseMerchants([]);
//     };

//     return (
//         <div className="max-w-9xl mx-auto">
//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-gray-800">Wallet Adjustment</h1>
//                 <p className="text-gray-600 mt-1">Manage and adjust customer wallet balances</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Customer</h2>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Customer Type <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 value={customerType}
//                                 onChange={(e) => {
//                                     setCustomerType(e.target.value);
//                                     resetSelections();
//                                 }}
//                                 className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                             >
//                                 <option value="">Choose type...</option>
//                                 <option value="franchise">Franchise</option>
//                                 <option value="direct-merchant">Direct Merchant</option>
//                                 <option value="franchise-merchant">Franchise Merchant</option>
//                             </select>
//                         </div>

//                         {customerType === 'franchise' && (
//                             <div className="animate-fadeIn">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Franchise <span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     value={selectedFranchise}
//                                     onChange={(e) => setSelectedFranchise(e.target.value)}
//                                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                 >
//                                     <option value="">Choose franchise...</option>
//                                     {franchises.map(f => (
//                                         <option key={f.id} value={f.id}>{f.franchiseName}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}

//                         {customerType === 'direct-merchant' && (
//                             <div className="animate-fadeIn">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Merchant <span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     value={selectedMerchant}
//                                     onChange={(e) => setSelectedMerchant(e.target.value)}
//                                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                 >
//                                     <option value="">Choose merchant...</option>
//                                     {directMerchants.map(m => (
//                                         <option key={m.id} value={m.id}>{m.businessName}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}

//                         {customerType === 'franchise-merchant' && (
//                             <>
//                                 <div className="animate-fadeIn">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Select Franchise <span className="text-red-500">*</span>
//                                     </label>
//                                     <select
//                                         value={selectedFranchiseForMerchant}
//                                         onChange={(e) => {
//                                             setSelectedFranchiseForMerchant(e.target.value);
//                                             setSelectedMerchant('');
//                                         }}
//                                         className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                     >
//                                         <option value="">Choose franchise...</option>
//                                         {franchises.map(f => (
//                                             <option key={f.id} value={f.id}>{f.franchiseName}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="animate-fadeIn">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Select Merchant <span className="text-red-500">*</span>
//                                     </label>
//                                     <select
//                                         value={selectedMerchant}
//                                         onChange={(e) => setSelectedMerchant(e.target.value)}
//                                         className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
//                                         disabled={!selectedFranchiseForMerchant}
//                                     >
//                                         <option value="">Choose merchant...</option>
//                                         {franchiseMerchants.map(m => (
//                                             <option key={m.id} value={m.id}>{m.businessName}</option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 </div>

//                 {walletInfo && (
//                     <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 animate-fadeIn">
//                         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                             <div className="flex-1">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div className="bg-white rounded-lg p-4 shadow-sm">
//                                         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer Name</p>
//                                         <p className="text-xl font-bold text-gray-800">{walletInfo.name}</p>
//                                     </div>
//                                     <div className="bg-white rounded-lg p-4 shadow-sm">
//                                         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Available Balance</p>
//                                         <p className="text-xl font-bold text-green-600">₹{walletInfo.balance?.toFixed(2)}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="md:ml-6">
//                                 <button
//                                     onClick={() => setShowModal(true)}
//                                     className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
//                                 >
//                                     <span className="flex items-center justify-center gap-2">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                                         </svg>
//                                         Adjust Wallet
//                                     </span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {!customerType && (
//                     <div className="p-12 text-center">
//                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
//                             <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                             </svg>
//                         </div>
//                         <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer Type</h3>
//                         <p className="text-gray-500 text-sm">Choose a customer type to begin wallet adjustment</p>
//                     </div>
//                 )}

//                 {customerType && !walletInfo && (
//                     <div className="p-12 text-center">
//                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
//                             <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                             </svg>
//                         </div>
//                         <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer</h3>
//                         <p className="text-gray-500 text-sm">Choose a customer to view wallet details</p>
//                     </div>
//                 )}
//             </div>

//             {showModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
//                         <div className="p-6 border-b border-gray-200">
//                             <h2 className="text-2xl font-bold text-gray-800">Wallet Adjustment</h2>
//                             <p className="text-sm text-gray-600 mt-1">Adjust wallet balance for {walletInfo?.name}</p>
//                         </div>

//                         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Transaction Type <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
//                                         className={`py-2.5 px-4 rounded-lg font-medium transition-all ${formData.type === 'CREDIT'
//                                                 ? 'bg-green-600 text-white shadow-md'
//                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                             }`}
//                                     >
//                                         Credit
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
//                                         className={`py-2.5 px-4 rounded-lg font-medium transition-all ${formData.type === 'DEBIT'
//                                                 ? 'bg-red-600 text-white shadow-md'
//                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                             }`}
//                                     >
//                                         Debit
//                                     </button>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Amount <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative">
//                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
//                                     <input
//                                         type="number"
//                                         step="0.01"
//                                         min="0.01"
//                                         value={formData.amount}
//                                         onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                                         className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                         placeholder="0.00"
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Remark <span className="text-red-500">*</span>
//                                 </label>
//                                 <textarea
//                                     value={formData.remark}
//                                     onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
//                                     rows="3"
//                                     placeholder="Enter reason for adjustment..."
//                                     required
//                                 />
//                             </div>

//                             <div className="flex gap-3 pt-4">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowModal(false);
//                                         setFormData({ type: 'CREDIT', amount: '', remark: '' });
//                                     }}
//                                     className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
//                                 >
//                                     {loading ? (
//                                         <span className="flex items-center justify-center gap-2">
//                                             <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Processing...
//                                         </span>
//                                     ) : 'Submit'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

           
//         </div>
//     );
// };

// export default WalletAdjustment;


import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const WalletAdjustment = () => {
    const [customerType, setCustomerType] = useState('');
    const [franchises, setFranchises] = useState([]);
    const [directMerchants, setDirectMerchants] = useState([]);
    const [franchiseMerchants, setFranchiseMerchants] = useState([]);

    const [selectedFranchise, setSelectedFranchise] = useState('');
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [selectedFranchiseForMerchant, setSelectedFranchiseForMerchant] = useState('');

    const [walletInfo, setWalletInfo] = useState(null);

    const [formData, setFormData] = useState({
        type: 'CREDIT',
        amount: '',
        remark: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customerType) {
            fetchData();
        }
    }, [customerType]);

    useEffect(() => {
        if (customerType === 'franchise-merchant' && selectedFranchiseForMerchant) {
            fetchFranchiseMerchants();
        }
    }, [selectedFranchiseForMerchant]);

    const fetchData = async () => {
        try {
            if (customerType === 'franchise') {
                const res = await api.get('/franchise');
                setFranchises(res.data);
            } else if (customerType === 'direct-merchant') {
                const res = await api.get('/merchants/direct-merchant');
                setDirectMerchants(res.data);
            } else if (customerType === 'franchise-merchant') {
                const res = await api.get('/franchise');
                setFranchises(res.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
    };

    const fetchFranchiseMerchants = async () => {
        try {
            const res = await api.get('/merchants/franchise-merchant');
            const filtered = res.data.filter(m => m.franchiseId === parseInt(selectedFranchiseForMerchant));
            setFranchiseMerchants(filtered);
        } catch (err) {
            console.error('Error fetching franchise merchants:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch merchants');
        }
    };

    const fetchWalletBalance = async (customerId) => {
        try {
            const endpoint = customerType === 'franchise'
                ? `/wallet-adjustment/franchise/${customerId}`
                : `/wallet-adjustment/merchant/${customerId}`;

            const res = await api.get(endpoint);
            return res.data.availableBalance;
        } catch (err) {
            console.error('Error fetching wallet balance:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch wallet balance');
            return null;
        }
    };

    const fetchWallet = async () => {
        try {
            let id, name, balance;

            if (customerType === 'franchise') {
                const franchise = franchises.find(f => f.id === parseInt(selectedFranchise));
                if (franchise) {
                    id = franchise.id;
                    name = franchise.franchiseName;
                    balance = await fetchWalletBalance(id);
                }
            } else if (customerType === 'direct-merchant') {
                const merchant = directMerchants.find(m => m.id === parseInt(selectedMerchant));
                if (merchant) {
                    id = merchant.id;
                    name = merchant.businessName;
                    balance = await fetchWalletBalance(id);
                }
            } else if (customerType === 'franchise-merchant') {
                const merchant = franchiseMerchants.find(m => m.id === parseInt(selectedMerchant));
                if (merchant) {
                    id = merchant.id;
                    name = merchant.businessName;
                    balance = await fetchWalletBalance(id);
                }
            }

            setWalletInfo({ id, name, balance });
        } catch (err) {
            console.error('Error fetching wallet:', err);
        }
    };

    useEffect(() => {
        if (customerType === 'franchise' && selectedFranchise) {
            fetchWallet();
        } else if (customerType === 'direct-merchant' && selectedMerchant) {
            fetchWallet();
        } else if (customerType === 'franchise-merchant' && selectedMerchant) {
            fetchWallet();
        } else {
            setWalletInfo(null);
        }
    }, [selectedFranchise, selectedMerchant, customerType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                customerId: walletInfo.id,
                actionOnBalance: formData.type,
                amount: parseFloat(formData.amount),
                remark: formData.remark
            };

            const endpoint = customerType === 'franchise'
                ? '/wallet-adjustment/franchise'
                : '/wallet-adjustment/merchant';

            await api.post(endpoint, payload);

            toast.success('Wallet adjustment successful');
            setFormData({ type: 'CREDIT', amount: '', remark: '' });

            // Fetch updated balance
            const updatedBalance = await fetchWalletBalance(walletInfo.id);
            if (updatedBalance !== null) {
                setWalletInfo(prev => ({ ...prev, balance: updatedBalance }));
            }

            // Refresh the lists to get updated balances
            fetchData();
        } catch (err) {
            console.error('Error adjusting wallet:', err);
            toast.error(err.response?.data?.message || 'Failed to adjust wallet');
        } finally {
            setLoading(false);
        }
    };

    const resetSelections = () => {
        setSelectedFranchise('');
        setSelectedMerchant('');
        setSelectedFranchiseForMerchant('');
        setWalletInfo(null);
        setFranchises([]);
        setDirectMerchants([]);
        setFranchiseMerchants([]);
        setFormData({ type: 'CREDIT', amount: '', remark: '' });
    };

    return (
        <div className="max-w-9xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Wallet Adjustment</h1>
                <p className="text-gray-600 mt-1">Manage and adjust customer wallet balances</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Customer</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerType}
                                onChange={(e) => {
                                    setCustomerType(e.target.value);
                                    resetSelections();
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Choose type...</option>
                                <option value="franchise">Franchise</option>
                                <option value="direct-merchant">Direct Merchant</option>
                                <option value="franchise-merchant">Franchise Merchant</option>
                            </select>
                        </div>

                        {customerType === 'franchise' && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Franchise <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedFranchise}
                                    onChange={(e) => setSelectedFranchise(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Choose franchise...</option>
                                    {franchises.map(f => (
                                        <option key={f.id} value={f.id}>{f.franchiseName}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {customerType === 'direct-merchant' && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Merchant <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedMerchant}
                                    onChange={(e) => setSelectedMerchant(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Choose merchant...</option>
                                    {directMerchants.map(m => (
                                        <option key={m.id} value={m.id}>{m.businessName}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {customerType === 'franchise-merchant' && (
                            <>
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Franchise <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedFranchiseForMerchant}
                                        onChange={(e) => {
                                            setSelectedFranchiseForMerchant(e.target.value);
                                            setSelectedMerchant('');
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Choose franchise...</option>
                                        {franchises.map(f => (
                                            <option key={f.id} value={f.id}>{f.franchiseName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Merchant <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedMerchant}
                                        onChange={(e) => setSelectedMerchant(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        disabled={!selectedFranchiseForMerchant}
                                    >
                                        <option value="">Choose merchant...</option>
                                        {franchiseMerchants.map(m => (
                                            <option key={m.id} value={m.id}>{m.businessName}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {walletInfo && (
                    <div className="animate-fadeIn">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer Name</p>
                                    <p className="text-xl font-bold text-gray-800">{walletInfo.name}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Available Balance</p>
                                    <p className="text-xl font-bold text-green-600">₹{walletInfo.balance?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adjustment Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'CREDIT' })}
                                        className={`w-20 py-1.5 rounded-md text-sm font-medium transition-all ${formData.type === 'CREDIT'
                                                ? 'bg-green-600 text-white shadow'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Credit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'DEBIT' })}
                                        className={`w-20 py-1.5 rounded-md text-sm font-medium transition-all ${formData.type === 'DEBIT'
                                                ? 'bg-red-600 text-white shadow'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Debit
                                    </button>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remark <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.remark}
                                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter reason for adjustment..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ type: 'CREDIT', amount: '', remark: '' })}
                                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : 'Submit Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!customerType && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer Type</h3>
                        <p className="text-gray-500 text-sm">Choose a customer type to begin wallet adjustment</p>
                    </div>
                )}

                {customerType && !walletInfo && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer</h3>
                        <p className="text-gray-500 text-sm">Choose a customer to view wallet details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletAdjustment;