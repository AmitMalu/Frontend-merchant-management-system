import React from 'react';
import { AlertCircle, X, KeyRound } from 'lucide-react';

const PasswordExpiryWarningBanner = ({
    message,
    daysLeft,
    onDismiss,
    onChangePassword
}) => {
    // Determine color scheme based on urgency
    const getUrgencyStyles = () => {
        if (daysLeft <= 3) {
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: 'text-red-600',
                button: 'bg-red-600 hover:bg-red-700'
            };
        } else if (daysLeft <= 7) {
            return {
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                text: 'text-orange-800',
                icon: 'text-orange-600',
                button: 'bg-orange-600 hover:bg-orange-700'
            };
        } else {
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                icon: 'text-yellow-600',
                button: 'bg-yellow-600 hover:bg-yellow-700'
            };
        }
    };

    const styles = getUrgencyStyles();

    return (
        <div className={`${styles.bg} border-b ${styles.border} px-4 py-3 shadow-sm relative`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left Section - Icon & Message */}
                <div className="flex items-center gap-3 flex-1">
                    <AlertCircle className={`${styles.icon} flex-shrink-0`} size={24} />

                    <div className="flex-1">
                        <p className={`${styles.text} font-medium text-sm md:text-base`}>
                            {message}
                        </p>
                        {daysLeft <= 3 && (
                            <p className={`${styles.text} text-xs mt-1 font-semibold`}>
                                ⚠️ Urgent: Change your password immediately to avoid account lockout!
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Change Password Button */}
                    <button
                        onClick={onChangePassword}
                        className={`${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium 
              flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md`}
                    >
                        <KeyRound size={16} />
                        <span className="hidden sm:inline">Change Password</span>
                        <span className="sm:hidden">Change</span>
                    </button>

                    {/* Dismiss Button - Only show if more than 3 days left */}
                    {daysLeft > 3 && (
                        <button
                            onClick={onDismiss}
                            className={`${styles.text} hover:opacity-75 p-2 rounded-full transition-all duration-200`}
                            aria-label="Dismiss warning"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar - Visual indicator of time remaining */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div
                    className={`h-full transition-all duration-300 ${daysLeft <= 3 ? 'bg-red-600' : daysLeft <= 7 ? 'bg-orange-600' : 'bg-yellow-600'
                        }`}
                    style={{ width: `${Math.max(0, (daysLeft / 15) * 100)}%` }}
                />
            </div>
        </div>
    );
};

export default PasswordExpiryWarningBanner;