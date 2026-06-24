import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FileText, X, Download, Eye, Trash2 } from 'lucide-react'
import api from "../../../constants/API/axiosInstance"
import { toast } from 'react-toastify'
import { BankDetailsForm, BasicDetailsForm, ContactDetailsForm, CustomerTypeSelection, DocumentPreview, DocumentsForm, FranchiseSelectionForm } from './DetailsComponent'

// Main Component
const CustomerOnboarding = ({
  // Context props
  isModal = false,
  onClose = null,

  // Edit mode props
  isEditMode = false,
  customerData = null,
  customerId = null,
  customerType: propCustomerType = null,

  // Success callback
  onSuccess = null
}) => {
  // Check if user is franchise from localStorage
  const userType = typeof window !== 'undefined' ? localStorage.getItem('userType')?.toLowerCase() : null
  const franchiseId = typeof window !== 'undefined' ? localStorage.getItem('customerId') || localStorage.getItem('franchiseId') : null
  const isFranchiseContext = userType === 'franchise' && franchiseId

  // Initialize customer type
  const [customerType, setCustomerType] = useState(() => {

    if (propCustomerType) return propCustomerType
    if (isEditMode) return customerData?.franchiseName ? 'franchise' : 'merchant'
    if (isFranchiseContext) return 'merchant'

    return ''
  })

  // Initialize current step based on context
  const [currentStep, setCurrentStep] = useState(() => {
    if (isFranchiseContext) return 1 // Start from step 1 for franchise (which will be basic details)
    if (isEditMode) return 1
    if (customerType) return customerType === 'merchant' ? 2 : 2 // Start from step 2 for both after type selection
    return 1 // Start from customer type selection
  })

  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [documentPreview, setDocumentPreview] = useState(null)
  const [franchises, setFranchises] = useState([])
  const [franchiseLoading, setFranchiseLoading] = useState(false)
  const [panVerified, setPanVerified] = useState(false)
  const [bankVerified, setBankVerified] = useState(false)

  // Form with default values for edit mode
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: isEditMode ? {
      businessName: customerData?.businessName || customerData?.franchiseName || '',
      legalName: customerData?.legalName || '',
      businessType: customerData?.businessType || '',
      gstNumber: customerData?.gstNumber || '',
      panNumber: customerData?.panNumber || '',
      registrationNumber: customerData?.registrationNumber || '',
      businessAddress: customerData?.businessAddress || customerData?.address || '',
      primaryContactName: customerData?.contactPerson?.name || customerData?.primaryContactName || '',
      primaryContactMobile: customerData?.contactPerson?.phoneNumber || customerData?.primaryContactMobile || '',
      primaryContactEmail: customerData?.contactPerson?.email || customerData?.primaryContactEmail || '',
      alternateContactMobile: customerData?.alternatePhoneNum || '',
      landlineNumber: customerData?.landlineNumber || '',
      bankName: customerData?.bankName || '',
      accountHolderName: customerData?.accountHolderName || '',
      accountNumber: customerData?.accountNumber || '',
      ifscCode: customerData?.ifscCode || '',
      branchName: customerData?.branchName || '',
      accountType: customerData?.accountType || '',
      franchiseId: customerData?.franchiseId || ''
    } : {}
  })

  // Fetch franchises for merchant selection
  const fetchFranchises = async () => {
    try {
      setFranchiseLoading(true)
      const response = await api.get('/franchise')
      const franchiseOptions = response.data.map(franchise => ({
        value: franchise.id,
        label: franchise.franchiseName
      }))
      setFranchises(franchiseOptions)
    } catch (err) {
      console.error('Error fetching franchises:', err)
      toast.error('Failed to load franchises')
    } finally {
      setFranchiseLoading(false)
    }
  }

  const handleVerifyPan = async (
  panNumber,
  fullName
) => {

  console.log("PAN =", panNumber)
console.log("FULL NAME =", fullName)

  if (!panNumber) {

    toast.error("Please enter PAN Number")
    return
  }

  if (!fullName) {

    toast.error("Please enter Business/Franchise Name")
    return
  }

  try {

    const response =
      await api.post(
        "/verification/pan",
        {

          panNumber,
          fullName,
          dob: "2000-01-01"

        }
      )

    if (
      response.data.status ===
      "SUCCESS"
    ) {

      setPanVerified(true)

      toast.success(
        response.data.message
      )

    }

    else {

      setPanVerified(false)

      toast.error(

        response.data.message ||

        "PAN verification failed"

      )

    }

  }

  catch (error) {

    setPanVerified(false)

    toast.error(

      error.response?.data?.message ||

      "PAN verification failed"

    )

  }

}
  

  const handleVerifyBank =
async (

accountNumber,

ifscCode

) => {

  if (

      !accountNumber ||

      !ifscCode

  ){

      toast.error(

      "Enter Account Number and IFSC"

      )

      return

  }

  try{

      const response =
      await api.post(

      "/verification/bank",

      {

          accountNumber,

          ifsc: ifscCode

      }

      )

      if(

      response.data.status

      ===

      "SUCCESS"

      ){

          setBankVerified(true)

          setValue(

          "accountHolderName",

          response.data.data.full_name

          )

          toast.success(

          "Bank verified"

          )

      }

      else{

          setBankVerified(false)

          toast.error(

          response.data.message

          )

      }

  }

  catch(error){

      setBankVerified(false)

      toast.error(

      "Bank verification failed"

      )

  }

}

  // Handle customer type selection
  const handleCustomerTypeSelect = (type) => {
    setCustomerType(type)
    if (type === 'merchant') {
      fetchFranchises()
    }
    setCurrentStep(2) // Always go to step 2 after type selection
  }

  // Get steps configuration based on context
  const getStepsConfig = () => {
    if (isFranchiseContext) {
      // Franchise adding merchant: skip customer type, start from basic details
      return {
        steps: ['Basic Details', 'Contact Details', 'Bank Details', 'Documents'],
        stepMap: {
          1: 'basic',
          2: 'contact',
          3: 'bank',
          4: 'documents'
        }
      }
    }

    if (isEditMode) {
      const baseSteps = customerType === 'franchise'
        ? ['Basic Details', 'Contact Details', 'Bank Details', 'Documents']
        : ['Basic Details', 'Contact Details', 'Bank Details', 'Documents']

      return {
        steps: baseSteps,
        stepMap: {
          1: 'basic',
          2: 'contact',
          3: 'bank',
          4: 'documents'
        }
      }
    }

    if (customerType === 'franchise') {
      return {
        steps: ['Customer Type', 'Basic Details', 'Contact Details', 'Bank Details', 'Documents'],
        stepMap: {
          1: 'customerType',
          2: 'basic',
          3: 'contact',
          4: 'bank',
          5: 'documents'
        }
      }
    } else if (customerType === 'merchant') {
      return {
        steps: ['Customer Type', 'Franchise Selection', 'Basic Details', 'Contact Details', 'Bank Details', 'Documents'],
        stepMap: {
          1: 'customerType',
          2: 'franchise',
          3: 'basic',
          4: 'contact',
          5: 'bank',
          6: 'documents'
        }
      }
    }

    return {
      steps: ['Customer Type'],
      stepMap: {
        1: 'customerType'
      }
    }
  }

  const { steps, stepMap } = getStepsConfig()
  const currentStepType = stepMap[currentStep]

  // Create form data for submission
  const createFormData = (data) => {
    const formDataObj = new FormData()

    formDataObj.append("panVerified", panVerified)
    formDataObj.append("bankVerified", bankVerified)

    // Add franchise ID based on context
    if (isFranchiseContext) {
      formDataObj.append('franchiseId', franchiseId.toString())
    } else if (data.franchiseId) {
      formDataObj.append('franchiseId', data.franchiseId.toString())
    }

    // Add isApproved field when admin is adding merchant
    if (customerType === 'merchant' && userType !== 'franchise') {
      formDataObj.append('isApproved', 'true')
    }

    // For franchise, use franchiseName field
    if (customerType === 'franchise') {
      formDataObj.append('franchiseName', data.businessName)
    }

    // Append text fields
    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key] === 'string' && key !== 'businessName') {
        formDataObj.append(key, data[key])
      }
    })

    // Handle business name vs franchise name
    if (customerType === 'merchant') {
      formDataObj.append('businessName', data.businessName)
    }

    // Append files - only new files will be sent
    const fileFields = ['panCardDocument', 'gstCertificate', 'addressProof', 'bankProof']
    fileFields.forEach(field => {
      if (data[field] && data[field][0]) {
        formDataObj.append(field, data[field][0])
      }
    })

    return formDataObj
  }

  // Handle step submission
  const handleStepSubmit = async (data) => {
    setError('')
    const updatedFormData = { ...formData, ...data }
    setFormData(updatedFormData)

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final submission
      setLoading(true)

      try {
        if (isEditMode) {
          // Edit mode - use PUT
          const formDataToSend = createFormData(updatedFormData)
          const endpoint = customerType === 'franchise' ? `/franchise/${customerId}` : `/merchants/${customerId}`
          await api.put(endpoint, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
          })
          toast.success(`${customerType === 'franchise' ? 'Franchise' : 'Merchant'} updated successfully!`)
        } else {
          // Create mode
          const formDataToSend = createFormData(updatedFormData)
          const endpoint = customerType === 'franchise' ? '/franchise' : '/merchants'
          await api.post(endpoint, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
          })
          toast.success(`${customerType === 'franchise' ? 'Franchise' : 'Merchant'} added successfully!`)
        }

        // Reset form
        reset()
        setFormData({})

        // Reset to initial step based on context
        if (isFranchiseContext) {
          setCurrentStep(1) // Return to step 1 for franchise context
        } else if (isEditMode) {
          setCurrentStep(1)
        } else {
          setCurrentStep(1)
          setCustomerType('')
        }

        // Call success callback and close modal
        onSuccess?.()
        onClose?.()

      } catch (err) {
        console.error('API Error:', err)
        setError(
          err.response?.data?.message ||
          `An error occurred during ${isEditMode ? 'update' : 'submission'}. Please try again.`
        )
      } finally {
        setLoading(false)
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const handleDocumentPreview = (filePath, documentName) => {
    setDocumentPreview({ documentPath: filePath, documentName })
  }

  const handleDocumentDelete = async (fieldName) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const endpoint = customerType === 'franchise' ? `/franchise/${customerId}/document/${fieldName}` : `/merchants/${customerId}/document/${fieldName}`
        await api.delete(endpoint)
        toast.success('Document deleted successfully')
        // Clear the field value
        setValue(fieldName, null)
        // Refresh customer data if needed
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        toast.error('Failed to delete document')
      }
    }
  }

  // Set initial step based on context
  useEffect(() => {
    if (isFranchiseContext) {
      setCustomerType('merchant')
      setCurrentStep(1)
    } else if (isEditMode) {
      setCurrentStep(1)
    }
  }, [isFranchiseContext, isEditMode])

  const containerClass = isModal
    ? "space-y-6"
    : "max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg"

  const renderStepContent = () => {
    // Customer Type Selection
    if (currentStepType === 'customerType') {
      return <CustomerTypeSelection onSelect={handleCustomerTypeSelect} />
    }

    return (
      <form onSubmit={handleSubmit(handleStepSubmit)}>
        {/* Franchise Selection - for merchants only when not in franchise context */}
        {currentStepType === 'franchise' && !isFranchiseContext && (
          <FranchiseSelectionForm
            register={register}
            errors={errors}
            franchises={franchises}
            loading={franchiseLoading}
          />
        )}

        {/* Complete Details - For franchise context (includes basic, contact, and bank) */}
        {currentStepType === 'complete' && isFranchiseContext && (
          <div className="space-y-8">
            {/* Basic Details Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
              <BasicDetailsForm
                register={register}
                errors={errors}
                customerType={customerType}
                panVerified={panVerified}
                setPanVerified={setPanVerified}
                onVerifyPan={handleVerifyPan}
                watch={watch}

              />
            </div>

            {/* Contact Details Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>
              <ContactDetailsForm register={register} errors={errors} />
            </div>

            {/* Bank Details Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h3>
              <BankDetailsForm
                register={register}
                errors={errors}
                bankVerified={bankVerified}
                setBankVerified={setBankVerified}
                onVerifyBank={handleVerifyBank}
                watch={watch}
              />
            </div>
          </div>
        )}

        {/* Basic Details */}
        {currentStepType === 'basic' && (
          <BasicDetailsForm
            register={register}
            errors={errors}
            customerType={customerType}
            panVerified={panVerified}
            setPanVerified={setPanVerified}
            onVerifyPan={handleVerifyPan}
            watch={watch}
          />
        )}

        {/* Contact Details */}
        {currentStepType === 'contact' && (
          <ContactDetailsForm register={register} errors={errors} />
        )}

        {/* Bank Details */}
        {currentStepType === 'bank' && (
          <BankDetailsForm
            register={register}
            errors={errors}
            bankVerified={bankVerified}
            setBankVerified={setBankVerified}
            onVerifyBank={handleVerifyBank}
            watch={watch}
          />
        )}

        {/* Documents */}
        {currentStepType === 'documents' && (
          <DocumentsForm
            register={register}
            errors={errors}
            existingFiles={isEditMode ? customerData : null}
            onDocumentPreview={handleDocumentPreview}
            onDocumentDelete={isEditMode ? handleDocumentDelete : null}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation Buttons - Only show for form steps, not customer type selection */}
        {currentStepType !== 'customerType' && (
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (
                currentStep === steps.length ? (
                  isEditMode ? `Update ${customerType === 'franchise' ? 'Franchise' : 'Merchant'}` :
                    `Add ${customerType === 'franchise' ? 'Franchise' : 'Merchant'}`
                ) : 'Next Step'
              )}
            </button>
          </div>
        )}
      </form>
    )
  }

  return (
    <>
      <div className={containerClass}>
        {!isModal && (
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {isEditMode ? `Edit ${customerType === 'franchise' ? 'Franchise' : 'Merchant'}` :
              isFranchiseContext ? 'Add Merchant' :
                'Customer Onboarding'}
          </h1>
        )}

        {/* Progress Steps - Only show for multi-step process */}
        {steps.length > 1 && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const stepNumber = index + 1
                const isActive = stepNumber <= currentStep
                const isCompleted = stepNumber < currentStep

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className="text-xs mt-1 text-gray-600 text-center">{step}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex mt-2">
              <div
                className="h-1 bg-blue-600 transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                }}
              />
              <div className="flex-1 h-1 bg-gray-200" />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Document Preview Modal */}
      {documentPreview && (
        <DocumentPreview
          documentPath={documentPreview.documentPath}
          documentName={documentPreview.documentName}
          onClose={() => setDocumentPreview(null)}
        />
      )}
    </>
  )
}

export default CustomerOnboarding