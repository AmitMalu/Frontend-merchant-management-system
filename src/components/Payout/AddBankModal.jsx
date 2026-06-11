// AddBankModal.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Select from "react-select";
import api from '../../constants/API/axiosInstance';

const AddBankModal = ({ isOpen, onClose, onBankAdded }) => {

    const [vendorBanks, setVendorBanks] = useState([]);
    const [vendorStates, setVendorStates] = useState([]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchVendorData = async () => {
            try {
                const [banksRes, statesRes] = await Promise.all([
                    api.get(`/vimo-banks`),
                    api.get(`/vimo-states`)
                ]);

                setVendorBanks(banksRes.data || []);
                setVendorStates(statesRes.data || []);
            } catch (err) {
                toast.error("Failed to load bank/state list");
            }
        };

        fetchVendorData();
    }, [isOpen]);


    const [formData, setFormData] = useState({
        ifscCode: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        bankHolderName: ''
    });
    const [loading, setLoading] = useState(false);

    const customerId = localStorage.getItem('customerId');
    const customerType = localStorage.getItem('userType');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.ifscCode || !formData.bankName || !formData.accountNumber || !formData.confirmAccountNumber || !formData.bankHolderName) {
            toast.error('All fields are required');
            return false;
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            toast.error('Account numbers do not match');
            return false;
        }

        if (formData.ifscCode.length !== 11) {
            toast.error('IFSC code must be 11 characters');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Show info toast about the verification process
            toast.info('Verifying bank details and adding to your account. ₹1 will be debited from your wallet for verification.');

            // Single API call that handles both verification and adding bank
            const response = await api.post(`/payout/verify-and-add-bank/${customerId}`, {
                ifscCode: formData.ifscCode,
                bankName: formData.bankName,
                stateName: formData.stateName,  // NEW
                accountNumber: formData.accountNumber,
                bankHolderName: formData.bankHolderName,
                customerType
            });

            toast.success('Bank details verified and added successfully! ₹1 was debited for verification.');
            onBankAdded(response.data);
            resetForm();
            onClose();

        } catch (error) {
            // Handle different types of errors
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Invalid bank details. Please check and try again.');
            } else if (error.response?.status === 402) {
                toast.error('Insufficient wallet balance. Minimum ₹1 required for bank verification.');
            } else if (error.response?.status === 422) {
                toast.error('Bank verification failed. Please check your bank details.');
            } else {
                toast.error('Failed to add bank. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            ifscCode: '',
            bankName: '',
            accountNumber: '',
            confirmAccountNumber: '',
            bankHolderName: ''
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Bank Account</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Info banner about verification */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-blue-700 text-sm font-medium">Bank Verification Process</p>
                            <p className="text-blue-600 text-xs mt-1">₹1 will be debited from your wallet and sent to mentioned bank account to verify bank details. This ensures your account details are correct.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                IFSC Code *
                            </label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleInputChange}
                                placeholder="IFSC Code"
                                maxLength={11}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Bank Name *
                            </label>
                            <Select
                                options={vendorBanks.map(bank => ({
                                    value: bank.bankName,
                                    label: bank.bankName
                                }))}
                                value={
                                    formData.bankName
                                        ? { value: formData.bankName, label: formData.bankName }
                                        : null
                                }
                                onChange={(selected) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        bankName: selected?.value || ""
                                    }))
                                }
                                placeholder="Search or select bank..."
                                className="text-sm"
                            />

                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium  mb-1">
                            Beneficiary State *
                        </label>
                        <Select
                            options={vendorStates.map(state => ({
                                value: state.stateName,
                                label: state.stateName
                            }))}
                            value={
                                formData.stateName
                                    ? { value: formData.stateName, label: formData.stateName }
                                    : null
                            }
                            onChange={(selected) =>
                                setFormData(prev => ({
                                    ...prev,
                                    stateName: selected?.value || ""
                                }))
                            }
                            placeholder="Search or select state..."
                            className="text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="Account Number"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Account Number *
                        </label>
                        <input
                            type="text"
                            name="confirmAccountNumber"
                            value={formData.confirmAccountNumber}
                            onChange={handleInputChange}
                            placeholder="Confirm Account Number"
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                            <p className="text-red-500 text-xs mt-1">Account numbers do not match</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Holder Name *
                        </label>
                        <input
                            type="text"
                            name="bankHolderName"
                            value={formData.bankHolderName}
                            onChange={handleInputChange}
                            placeholder="Account Holder Name"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-blue-500 text-white py-2 px-6 rounded font-medium hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Verifying & Adding...
                                </>
                            ) : (
                                'Verify & Add Bank'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBankModal;