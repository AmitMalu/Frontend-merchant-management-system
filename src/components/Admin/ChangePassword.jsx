import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../constants/API/axiosInstance';

const ChangePassword = () => {
    const [customerType, setCustomerType] = useState('');
    const [franchises, setFranchises] = useState([]);
    const [directMerchants, setDirectMerchants] = useState([]);
    const [franchiseMerchants, setFranchiseMerchants] = useState([]);

    const [selectedFranchise, setSelectedFranchise] = useState('');
    const [selectedMerchant, setSelectedMerchant] = useState('');
    const [selectedFranchiseForMerchant, setSelectedFranchiseForMerchant] = useState('');

    const [selectedEntity, setSelectedEntity] = useState(null); // { entityType, entityId, name }

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    const [showConfirm, setShowConfirm] = useState(false);
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

    useEffect(() => {
        if (customerType === 'franchise' && selectedFranchise) {
            const franchise = franchises.find(f => f.id === parseInt(selectedFranchise));
            setSelectedEntity(franchise ? { entityType: 'FRANCHISE', entityId: franchise.id, name: franchise.franchiseName } : null);
        } else if (customerType === 'direct-merchant' && selectedMerchant) {
            const merchant = directMerchants.find(m => m.id === parseInt(selectedMerchant));
            setSelectedEntity(merchant ? { entityType: 'MERCHANT', entityId: merchant.id, name: merchant.businessName } : null);
        } else if (customerType === 'franchise-merchant' && selectedMerchant) {
            const merchant = franchiseMerchants.find(m => m.id === parseInt(selectedMerchant));
            setSelectedEntity(merchant ? { entityType: 'MERCHANT', entityId: merchant.id, name: merchant.businessName } : null);
        } else {
            setSelectedEntity(null);
        }
    }, [selectedFranchise, selectedMerchant, customerType, franchises, directMerchants, franchiseMerchants]);

    const resetSelections = () => {
        setSelectedFranchise('');
        setSelectedMerchant('');
        setSelectedFranchiseForMerchant('');
        setSelectedEntity(null);
        setFranchises([]);
        setDirectMerchants([]);
        setFranchiseMerchants([]);
        resetPasswordFields();
    };

    const resetPasswordFields = () => {
        setNewPassword('');
        setConfirmPassword('');
        setFormError('');
    };

    const validate = () => {
        if (!newPassword || newPassword.length < 8) {
            return 'New password must be at least 8 characters';
        }
        if (newPassword !== confirmPassword) {
            return 'Passwords do not match';
        }
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validate();
        if (error) {
            setFormError(error);
            return;
        }
        setFormError('');
        setShowConfirm(true);
    };

    const confirmReset = async () => {
        setLoading(true);
        try {
            await api.post('/users/admin/reset-password', {
                entityType: selectedEntity.entityType,
                entityId: selectedEntity.entityId,
                newPassword
            });

            toast.success(`Password changed successfully for ${selectedEntity.name}`);
            resetPasswordFields();
        } catch (err) {
            console.error('Error resetting password:', err);
            toast.error(err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="max-w-9xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Change Password</h1>
                <p className="text-gray-600 mt-1">Reset the login password for a franchise or merchant on their behalf</p>
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
                                <option value="direct-merchant">Direct Merchant</option>
                                <option value="franchise">Franchise</option>
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

                {selectedEntity && (
                    <div className="animate-fadeIn">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                            <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    {selectedEntity.entityType === 'FRANCHISE' ? 'Franchise' : 'Merchant'}
                                </p>
                                <p className="text-xl font-bold text-gray-800">{selectedEntity.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Password</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter new password"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Re-enter new password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="text-sm text-red-600">{formError}</p>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetPasswordFields}
                                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!customerType && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer Type</h3>
                        <p className="text-gray-500 text-sm">Choose a customer type to begin changing a password</p>
                    </div>
                )}

                {customerType && !selectedEntity && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Select Customer</h3>
                        <p className="text-gray-500 text-sm">Choose a customer to change their password</p>
                    </div>
                )}
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Password Change</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to change the password for{' '}
                            <span className="font-semibold text-gray-800">{selectedEntity?.name}</span>?
                            They will need to use the new password the next time they log in.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={confirmReset}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
                            >
                                {loading ? 'Changing...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
