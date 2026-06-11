import React from 'react';
import { X, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';

// ==================== BASIC INPUT COMPONENTS ====================

export const FormInput = ({ label, name, register, errors, type = "text", placeholder = "", maxLength, style, disabled = false, required = false, validation = {}, className = "", rightIcon,    ...props}) => {
    // Build dynamic validation rules
    const rules = {
        ...(required && { required: `${label} is required` }),
        ...(type === "email" && {
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
        }),
        ...(type === "number" && { valueAsNumber: true }),
        ...validation,
    };

    return (
        <div>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Input */}
            {/* Input wrapper for relative positioning */}
            <div className="relative">
                <input
                    {...register(name, rules)}
                    type={type}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    style={style}
                    disabled={disabled}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent
            ${errors?.[name] ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            ${rightIcon ? "pr-10" : ""}   // <-- add padding if icon exists
            ${className}`}
                    {...props}
                />

                {/* Right Icon */}
                {rightIcon && (
                    <span className="absolute inset-y-0 right-3 flex items-center">
                        {rightIcon}
                    </span>
                )}
            </div>


            {/* Error message */}
            {errors?.[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
            )}
        </div>
    );
};

// ==================== BASIC BUTTON COMPONENTS ====================
export const Button = ({    children,    onClick,    disabled = false,    type = "button",    variant = "primary",    className = "",    ...props}) => {
    const baseClasses =
        "font-semibold text-base rounded-xl transition-all duration-300 focus:outline-none";

    const variants = {
        primary:
            "w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
        secondary:
            "w-full py-3 bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed",
        link: "text-blue-500 text-sm font-medium hover:underline",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// ==================== SELECT COMPONENTS ====================

export const FormSelect = ({    label,    name,    register,    errors,    options = [],    required = false,    placeholder = "Select an option",    className = "",    validation = {},    ...props}) => {
    // Validation rules
    const rules = {
        ...(required && { required: `${label} is required` }),
        ...validation, // custom rules
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <select
                {...register(name, rules)}
                defaultValue=""
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${errors?.[name] ? "border-red-500" : "border-gray-300"
                    } ${className}`}
                {...props}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {errors?.[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
            )}
        </div>
    );
};

// ==================== TEXTAREA COMPONENTS ====================

export const FormTextarea = ({    label,    name,    register,   errors,  required = false,    rows = 3,    placeholder = "",    className = "",    validation = {},    ...props}) => {
    const rules = {
        ...(required && { required: `${label} is required` }),
        ...validation,
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <textarea
                {...register(name, rules)}
                rows={rows}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent
          ${errors?.[name] ? "border-red-500" : "border-gray-300"}
          ${className}`}
                {...props}
            />

            {errors?.[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
            )}
        </div>
    );
};


// ==================== ACTION COMPONENTS ====================

export const FormActions = ({ onCancel, isSubmitting = false, isLoading = false, isEdit = false, submitText, cancelText = "Cancel", theme = "blue", showLoader = false, className = "" }) => {
    // Theme colors
    const themeClasses = {
        blue: {
            base: "bg-blue-600 hover:bg-blue-700",
            border: "border-blue-600",
        },
        green: {
            base: "bg-green-600 hover:bg-green-700",
            border: "border-green-600",
        },
    };

    const colors = themeClasses[theme] || themeClasses.blue;

    return (
        <div className={`flex justify-end space-x-4 pt-6 border-t border-gray-200 ${className}`}>
            {/* Cancel Button */}
            <button
                type="button"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                {cancelText}
            </button>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${colors.base}`}
            >
                {showLoader && isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                    {isLoading || isSubmitting
                        ? "Saving..."
                        : submitText || (isEdit ? "Update" : "Create")}
                </span>
            </button>
        </div>
    );
};

// ==================== SPECIAL COMPONENTS ====================

// Status Toggle Component
export const StatusToggle = ({ status, onToggle }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
        </label>
        <div className="flex items-center space-x-3">
            <button
                type="button"
                onClick={onToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${status
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
            >
                {status ? (
                    <ToggleRight className="h-5 w-5" />
                ) : (
                    <ToggleLeft className="h-5 w-5" />
                )}
                <span className="font-medium">
                    {status ? 'Active' : 'Inactive'}
                </span>
            </button>
        </div>
    </div>
);


// Card Rate Item Component (from first file)
export const CardRateItem = ({ index, register, errors, onRemove }) => {
    return (
        <div className="flex items-end gap-3 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Type <span className="text-red-500">*</span>
                </label>
                <input
                    {...register(`vendorCardRates.${index}.cardType`, { required: 'Card type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter card type"
                />
                {errors.vendorCardRates?.[index]?.cardType && (
                    <p className="mt-1 text-sm text-red-500">{errors.vendorCardRates[index].cardType.message}</p>
                )}
            </div>

            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                    {...register(`vendorCardRates.${index}.rate`, {
                        required: 'Rate is required',
                        min: { value: 0, message: 'Rate must be positive' },
                        max: { value: 100, message: 'Rate cannot exceed 100%' }
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5"
                />
                {errors.vendorCardRates?.[index]?.rate && (
                    <p className="mt-1 text-sm text-red-500">{errors.vendorCardRates[index].rate.message}</p>
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Remove card type"
            >
                <X size={20} />
            </button>
        </div>
    );
};

// ==================== LAYOUT COMPONENTS ====================

// Section Header Component
export const SectionHeader = ({ icon: Icon, title }) => (
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Icon className="h-5 w-5 mr-2 text-blue-600" />
        {title}
    </h2>
);

// Form Section Component
export const FormSection = ({ title, icon, children }) => (
    <div>
        <SectionHeader icon={icon} title={title} />
        {children}
    </div>
);

// Grid Layout Component
export const GridLayout = ({ columns = "1 md:2", gap = "6", children }) => (
    <div className={`grid grid-cols-${columns.replace(' md:', ' md:grid-cols-')} gap-${gap}`}>
        {children}
    </div>
);

// Modal Container Component
export const Modal = ({ title, subtitle, onClose, children }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-6 rounded-t-lg sticky top-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-gray-100">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
            {children}
        </div>
    </div>
);

// Form Header Component (Green theme)
export const FormHeader = ({ isEdit, onCancel, icon: Icon, title, subtitle }) => (
    <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Icon className="h-8 w-8" />
                <div>
                    <h1 className="text-2xl font-bold">
                        {title || (isEdit ? 'Edit Item' : 'Add New Item')}
                    </h1>
                    <p className="text-gray-100">
                        {subtitle || (isEdit ? 'Update item information' : 'Register a new item in the system')}
                    </p>
                </div>
            </div>
            <button
                onClick={onCancel}
                className="text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
                ✕
            </button>
        </div>
    </div>
);

// ==================== UTILITY COMPONENTS ====================

// Error Display Component
export const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    );
};

// Loading Spinner Component
export const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">{message}</p>
            </div>
        </div>
    </div>
);

