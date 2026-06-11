// Form Input Components
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, Phone, MapPin, FileText, Calendar,
  ToggleLeft, ToggleRight
} from 'lucide-react';

// Reusable Input Component
const FormInput = ({  label, name,  register,  error,  required = false,  type = "text", placeholder = "",  maxLength,  style, ...props}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...register(name)}
      type={type}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder}
      maxLength={maxLength}
      style={style}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Reusable Textarea Component
const FormTextarea = ({  label,  name,  register,  error, required = false,  rows = 3,  placeholder = "",  ...props}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      {...register(name)}
      rows={rows}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Reusable Select Component
const FormSelect = ({  label,  name,  register, error, required = false,  options = [],  placeholder = "Select an option", ...props}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      defaultValue=""
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
    {error && (
      <p className="text-red-500 text-sm mt-1">{error.message}</p>
    )}
  </div>
);

// Status Toggle Component
const StatusToggle = ({ status, onToggle }) => (
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

// Section Header Component
const SectionHeader = ({ icon: Icon, title }) => (
  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <Icon className="h-5 w-5 mr-2 text-blue-600" />
    {title}
  </h2>
);

// Form Section Component
const FormSection = ({ title, icon, children }) => (
  <div>
    <SectionHeader icon={icon} title={title} />
    {children}
  </div>
);

// Grid Layout Component
const GridLayout = ({ columns = "1 md:2", gap = "6", children }) => (
  <div className={`grid grid-cols-${columns.replace(' md:', ' md:grid-cols-')} gap-${gap}`}>
    {children}
  </div>
);

// Modal Container Component
const Modal = ({ title, subtitle, onClose, children }) => (
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

// Form Actions Component
const FormActions = ({ onCancel, isSubmitting, isEdit }) => (
  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSubmitting ? 'Saving...' : isEdit ? 'Update Vendor' : 'Create Vendor'}
    </button>
  </div>
);

// Validation Schema using Zod
const vendorSchema = z.object({
  name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  bankType: z.enum(['Central Bank', 'Private Sector', 'Public Sector', 'Co-operative', 'Rural Banks','Other'], {
    required_error: "Bank type is required"
  }),
  // optional contactPerson
  contactPerson: z.object({
    name: z.string().min(2, 'Contact person name is required').optional().or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
  }).optional().nullable().or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters').optional().nullable().or(z.literal('')),
  city: z.string().min(2, 'City is required').or(z.literal('')),
  state: z.string().min(2, 'State is required').or(z.literal('')),
  pinCode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits').or(z.literal('')),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').or(z.literal('')),
  agreementStartDate: z.string().min(1, 'Agreement start date is required'),
  agreementEndDate: z.string().min(1, 'Agreement end date is required'),
  creditPeriodDays: z.number().min(0, 'Credit period must be 0 or more days'),
  paymentTerms: z.string().min(5, 'Payment terms are required').optional().or(z.literal('')), // allow empty string
  status: z.boolean(),
  remarks: z.string().optional()
});


// Bank type options
const BANK_TYPE_OPTIONS = [
  { value: 'Central Bank', label: 'Central Bank' },
  { value: 'Private Sector', label: 'Private Sector' },
  { value: 'Public Sector', label: 'Public Sector' },
  { value: 'Co-operative', label: 'Co-operative' },
  { value: 'Rural Banks', label: 'Rural Banks' },
  { value: 'Other', label: 'Other' }
];

// Default form values
const DEFAULT_VALUES = {
  name: '',
  bankType: '',
  contactPerson: {
    name: '',
    email: '',
    phoneNumber: ''
  },
  address: '',
  city: '',
  state: '',
  pinCode: '',
  gstNumber: '',
  pan: '',
  agreementStartDate: '',
  agreementEndDate: '',
  creditPeriodDays: 30,
  paymentTerms: '',
  status: true,
  remarks: ''
};

// Main Vendor Form Component
const VendorForm = ({ onSubmit, onCancel, initialData = null, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || DEFAULT_VALUES
  });

  const watchStatus = watch('status');

  const toggleStatus = () => {
    setValue('status', !watchStatus);
  };

  return (
    <Modal
      title={isEdit ? 'Edit Vendor' : 'Add New Vendor'}
      subtitle={isEdit ? 'Update vendor information' : 'Register a new vendor in the system'}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Basic Information */}
        <FormSection title="Basic Information" icon={Building2}>
          <GridLayout>
            <FormInput
              label="Vendor Name"
              name="name"
              register={register}
              error={errors.name}
              required
              placeholder="Enter vendor name"
            />

            <FormSelect
              label="Bank Type"
              name="bankType"
              register={register}
              error={errors.bankType}
              required
              options={BANK_TYPE_OPTIONS}
              placeholder="Select Bank Type"
            />

            <StatusToggle
              status={watchStatus}
              onToggle={toggleStatus}
            />
          </GridLayout>
        </FormSection>

        {/* Contact Person Information */}
        <FormSection title="Contact Person Information" icon={Phone}>
          <GridLayout>
            <FormInput
              label="Contact Person Name"
              name="contactPerson.name"
              register={register}
              error={errors.contactPerson?.name}
              
              placeholder="Enter contact person name"
            />

            <FormInput
              label="Phone Number"
              name="contactPerson.phoneNumber"
              register={register}
              error={errors.contactPerson?.phoneNumber}
              
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />

            <FormInput
              label="Email Address"
              name="contactPerson.email"
              register={register}
              error={errors.contactPerson?.email}
              
              type="email"
              placeholder="Enter email address"
            />
          </GridLayout>
        </FormSection>

        {/* Address Information */}
        <FormSection title="Address Information" icon={MapPin}>
          <div className="space-y-6">
            <FormTextarea
              label="Address"
              name="address"
              register={register}
              error={errors.address}
              
              placeholder="Enter complete address"
            />

            <GridLayout columns="1 md:3">
              <FormInput
                label="City"
                name="city"
                register={register}
                error={errors.city}
                
                placeholder="Enter city"
              />

              <FormInput
                label="State"
                name="state"
                register={register}
                error={errors.state}
                
                placeholder="Enter state"
              />

              <FormInput
                label="Pincode"
                name="pinCode"
                register={register}
                error={errors.pinCode}
                
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
            </GridLayout>
          </div>
        </FormSection>

        {/* Legal Information */}
        <FormSection title="Legal Information" icon={FileText}>
          <GridLayout>
            <FormInput
              label="GST Number"
              name="gstNumber"
              register={register}
              error={errors.gstNumber}
              
              placeholder="Enter GST number (15 digits)"
              maxLength={15}
              style={{ textTransform: 'uppercase' }}
            />

            <FormInput
              label="PAN Number"
              name="pan"
              register={register}
              error={errors.pan}
              
              placeholder="Enter PAN number (10 digits)"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
          </GridLayout>
        </FormSection>

        {/* Agreement Terms */}
        <FormSection title="Agreement Terms" icon={Calendar}>
          <GridLayout>
            <FormInput
              label="Agreement Start Date"
              name="agreementStartDate"
              register={register}
              error={errors.agreementStartDate}
              required
              type="date"
            />

            <FormInput
              label="Agreement End Date"
              name="agreementEndDate"
              register={register}
              error={errors.agreementEndDate}
              required
              type="date"
            />

            <FormInput
              label="Credit Period (Days)"
              name="creditPeriodDays"
              register={register}
              error={errors.creditPeriodDays}
              required
              type="number"
              min="0"
              placeholder="Enter credit period in days"
              {...register('creditPeriodDays', { valueAsNumber: true })}
            />

            <FormInput
              label="Payment Terms"
              name="paymentTerms"
              register={register}
              error={errors.paymentTerms}
              
              placeholder="e.g., Net 30, Advance payment"
            />
          </GridLayout>
        </FormSection>

        {/* Remarks */}
        <FormTextarea
          label="Remarks"
          name="remarks"
          register={register}
          error={errors.remarks}
          placeholder="Enter any additional remarks or notes"
        />

        {/* Form Actions */}
        <FormActions
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
        />
      </form>
    </Modal>
  );
};

export default VendorForm;