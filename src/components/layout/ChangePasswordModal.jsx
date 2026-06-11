import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({
    isOpen,
    onClose,
    userEmail,
    isFirstTimeLogin = false,
    onPasswordChangeSuccess
}) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Validation function
    const validatePasswordData = (data) => {
        const errors = {};

        // Current password validation (skip for first time login if needed)
        if (!isFirstTimeLogin) {
            if (!data.currentPassword || data.currentPassword.trim() === '') {
                errors.currentPassword = 'Current password is required';
            }
        }

        // New password validation
        if (!data.newPassword || data.newPassword.trim() === '') {
            errors.newPassword = 'New password is required';
        } else {
            if (data.newPassword.length < 8) {
                errors.newPassword = 'Password must be at least 8 characters';
            } else if (!/[A-Z]/.test(data.newPassword)) {
                errors.newPassword = 'Password must contain at least one uppercase letter';
            } else if (!/[0-9]/.test(data.newPassword)) {
                errors.newPassword = 'Password must contain at least one number';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) {
                errors.newPassword = 'Password must contain at least one special character';
            }
        }

        // Confirm password validation
        if (!data.confirmPassword || data.confirmPassword.trim() === '') {
            errors.confirmPassword = 'Please confirm your password';
        } else if (data.newPassword !== data.confirmPassword) {
            errors.confirmPassword = "Passwords don't match";
        }

        // Check if new password is same as current (only if not first time login)
        if (!isFirstTimeLogin && data.currentPassword && data.newPassword &&
            data.currentPassword === data.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        return errors;
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        setPasswordError('');
        setValidationErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setValidationErrors({});

        // Validate password data
        const errors = validatePasswordData(passwordData);

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                email: userEmail,
                newPassword: passwordData.newPassword,
                isFirstLogin: isFirstTimeLogin.toString()
            };

            // Only include current password if not first time login
            if (!isFirstTimeLogin) {
                payload.currentPassword = passwordData.currentPassword;
            }

            const response = await api.post('/users/change-password', payload);
            if (response?.status === 200) {
                toast.success(response.data?.message)
            }
            setPasswordSuccess('Password changed successfully!');

            // Call success callback if provided
            if (onPasswordChangeSuccess) {
                onPasswordChangeSuccess();
            }

            handleClose()
        } catch (error) {
            if (error.response) {
                setPasswordError(error.response.data.error || 'Failed to change password');
            } else {
                setPasswordError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isFirstTimeLogin) {
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordError('');
            setPasswordSuccess('');
            setValidationErrors({});
            setShowPasswords({
                current: false,
                new: false,
                confirm: false
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isFirstTimeLogin ? 'Set New Password' : 'Change Password'}
                        </h2>
                        {isFirstTimeLogin && (
                            <p className="text-sm text-gray-600 mt-1">
                                Please set a new password for your first login
                            </p>
                        )}
                    </div>
                    {!isFirstTimeLogin && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Modal Body */}
                <form onSubmit={handlePasswordSubmit} className="px-6 py-4">
                    {/* Current Password - Only show if not first time login */}
                    {!isFirstTimeLogin && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {validationErrors.currentPassword && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.currentPassword}</p>
                            )}
                        </div>
                    )}

                    {/* New Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isFirstTimeLogin ? 'New Password' : 'New Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {validationErrors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors.newPassword}</p>
                        )}
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">Password must contain:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                                <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                                    At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                    At least one uppercase letter
                                </li>
                                <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                    At least one number
                                </li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                    At least one special character
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{passwordError}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600">{passwordSuccess}</p>
                        </div>
                    )}

                    {/* Modal Footer */}
                    <div className="flex justify-end space-x-3 pt-4">
                        {!isFirstTimeLogin && (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Changing...' : isFirstTimeLogin ? 'Set Password' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;