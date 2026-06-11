import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CreditCardBillPayment = () => {
    const [formData, setFormData] = useState({
        cardHolderName: '',
        mobileNumber: '',
        cardNumber: '',
        confirmCardNumber: '',
        amount: '',
        remark: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Format card number with spaces (for display only)
        if (name === 'cardNumber' || name === 'confirmCardNumber') {
            // Remove all non-digits and limit to 16 digits
            const cleanValue = value.replace(/\D/g, '').slice(0, 16);
            setFormData(prev => ({
                ...prev,
                [name]: cleanValue
            }));
        }
        // Format mobile number (only digits, max 10)
        else if (name === 'mobileNumber') {
            const cleanValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: cleanValue
            }));
        }
        // Format amount (only numbers and decimal)
        else if (name === 'amount') {
            const cleanValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = cleanValue.split('.');
            const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const formatCardNumberDisplay = (cardNumber) => {
        return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    };

    const validateForm = () => {
        if (!formData.cardHolderName.trim()) {
            toast.error('Card holder name is required');
            return false;
        }

        if (!formData.mobileNumber) {
            toast.error('Mobile number is required');
            return false;
        }

        if (formData.mobileNumber.length !== 10) {
            toast.error('Mobile number must be 10 digits');
            return false;
        }

        if (!formData.cardNumber) {
            toast.error('Card number is required');
            return false;
        }

        if (formData.cardNumber.length !== 16) {
            toast.error('Card number must be 16 digits');
            return false;
        }

        if (formData.cardNumber !== formData.confirmCardNumber) {
            toast.error('Card numbers do not match');
            return false;
        }

        if (!formData.amount) {
            toast.error('Amount is required');
            return false;
        }

        if (parseFloat(formData.amount) <= 0) {
            toast.error('Amount must be greater than 0');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Console log the form data
            console.log('Credit Card Payment Details:', {
                cardHolderName: formData.cardHolderName,
                mobileNumber: formData.mobileNumber,
                cardNumber: formData.cardNumber,
                amount: parseFloat(formData.amount),
                remark: formData.remark || 'No remarks'
            });

            toast.success('Payment details submitted successfully!');

            // Reset form
            setFormData({
                cardHolderName: '',
                mobileNumber: '',
                cardNumber: '',
                confirmCardNumber: '',
                amount: '',
                remark: ''
            });

        } catch (error) {
            toast.error('Failed to submit payment details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                            💳 Credit Card Bill Payment
                        </h2>
                    </div>

                    {/* Form Container */}
                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Personal Details
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name of Card Holder */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name of Card Holder *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="cardHolderName"
                                                value={formData.cardHolderName}
                                                onChange={handleInputChange}
                                                placeholder="Enter cardholder name"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Number */}
                                    <div className="sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="tel"
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handleInputChange}
                                                placeholder="10-digit mobile"
                                                maxLength={10}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 font-medium">₹</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="Enter amount"
                                                className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Card Details
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Card Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formatCardNumberDisplay(formData.cardNumber)}
                                                onChange={handleInputChange}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm font-mono tracking-wider"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Card Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Card Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="confirmCardNumber"
                                                value={formatCardNumberDisplay(formData.confirmCardNumber)}
                                                onChange={handleInputChange}
                                                placeholder="Re-enter card number"
                                                maxLength={19}
                                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-all duration-200 text-sm font-mono tracking-wider ${formData.confirmCardNumber && formData.cardNumber !== formData.confirmCardNumber
                                                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                                                        : 'border-gray-300 focus:border-red-500'
                                                    }`}
                                                disabled={loading}
                                            />
                                        </div>
                                        {formData.confirmCardNumber && formData.cardNumber !== formData.confirmCardNumber && (
                                            <div className="mt-2 flex items-center text-red-600 text-sm">
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Card numbers do not match
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                    Additional Details
                                </h3>

                                {/* Remark */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remark <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            name="remark"
                                            value={formData.remark}
                                            onChange={handleInputChange}
                                            placeholder="Add any remarks or notes..."
                                            rows={3}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm resize-none"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                            Processing Payment...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            PAY NOW
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Notice */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
                            <p className="text-sm text-blue-700 mt-1">Your payment information is encrypted and secure. We never store your complete card details.</p>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default CreditCardBillPayment;