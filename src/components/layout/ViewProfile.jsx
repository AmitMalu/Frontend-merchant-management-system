import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { customerApi, fileApi } from '../../constants/API/customerApi';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard, 
  Download,
  ArrowLeft,
  Loader2,
  Store,
  Users
} from 'lucide-react';

const ViewProfile = () => {
  const id = localStorage.getItem("customerId")  // type can be 'franchise', 'merchant', or 'directMerchant'
  const type = localStorage.getItem("userType").toLowerCase()
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [id, type]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerApi.getCustomerDetails(id, type);
      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDownload = async (documentPath) => {
    if (!documentPath) return;
    
    try {
      const response = await fileApi.downloadFile(documentPath);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentPath);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const renderMerchantsList = (merchants) => {
    if (!merchants || merchants.length === 0) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Store className="w-5 h-5" />
          Associated Merchants ({merchants.length})
        </h3>
        <div className="space-y-3">
          {merchants.map((merchant) => (
            <div key={merchant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{merchant.businessName}</h4>
                  <p className="text-sm text-gray-600">{merchant.businessType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  merchant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {merchant.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Contact Person</p>
                  <p className="font-medium">{merchant.contactPersonName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{merchant.contactPersonPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{merchant.contactPersonEmail}</p>
                </div>
               
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFranchiseInfo = (franchise) => {
    if (!franchise) return null;

    return (
      <div className="mt-6 bg-blue-50 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Parent Franchise Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Franchise Name" value={franchise.franchiseName} />
          <InfoItem label="Legal Name" value={franchise.legalName} />
          <InfoItem label="GST Number" value={franchise.gstNumber} />
          <InfoItem label="PAN Number" value={franchise.panNumber} />
          <InfoItem label="Contact Person" value={franchise.contactPerson?.name} />
          <InfoItem label="Contact Phone" value={franchise.contactPerson?.phoneNumber} />
          <InfoItem label="Contact Email" value={franchise.contactPerson?.email} />
          <InfoItem label="Address" value={franchise.address} fullWidth />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>No profile data found</p>
      </div>
    );
  }

  const isFranchise = type === 'franchise';
  const data = isFranchise ? profileData.franchise : profileData;
  const merchants = isFranchise ? profileData.merchants : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Profile Details</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {isFranchise ? 'Franchise Information' : 'Merchant Information'}
          </h2>
          {data.status && (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              data.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {data.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem 
            label={isFranchise ? "Franchise Name" : "Business Name"} 
            value={isFranchise ? data.franchiseName : data.businessName} 
          />
          <InfoItem label="Legal Name" value={data.legalName} />
          <InfoItem label="Business Type" value={data.businessType} />
          <InfoItem label="GST Number" value={data.gstNumber} />
          <InfoItem label="PAN Number" value={data.panNumber} />
          <InfoItem label="Registration Number" value={data.registrationNumber} />
         
            <InfoItem label="Wallet Balance" value={`₹${data.walletBalance}`} />
        
          {!isFranchise && data.monthlyRevenue !== null && (
            <InfoItem label="Monthly Revenue" value={`₹${data.monthlyRevenue}`} />
          )}
          <InfoItem label="Address" value={data.businessAddress} fullWidth />
        </div>
      </div>

      {/* Contact Person Information */}
      {data.contactPerson && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-6 h-6" />
            Contact Person
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={<User className="w-4 h-4" />} label="Name" value={data.contactPerson.name} />
            <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone Number" value={data.contactPerson.phoneNumber} />
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={data.contactPerson.email} />
            {data.contactPerson.alternatePhoneNum && (
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Alternate Phone" value={data.contactPerson.alternatePhoneNum} />
            )}
            {data.contactPerson.landlineNumber && (
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Landline" value={data.contactPerson.landlineNumber} />
            )}
          </div>
        </div>
      )}

      {/* Bank Details */}
      {data.bankDetails && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Bank Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Bank Name" value={data.bankDetails.bankName} />
            <InfoItem label="Account Holder Name" value={data.bankDetails.accountHolderName} />
            <InfoItem label="Account Number" value={data.bankDetails.accountNumber} />
            <InfoItem label="IFSC Code" value={data.bankDetails.ifsc} />
            <InfoItem label="Branch Name" value={data.bankDetails.branchName} />
            <InfoItem label="Account Type" value={data.bankDetails.accountType} />
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      {data.uploadDocuments && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Uploaded Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.uploadDocuments).map(([key, value]) => {
              if (!value) return null;
              
              const labels = {
                panProof: 'PAN Card',
                adharProof: 'Aadhar Card',
                gstCertificateProof: 'GST Certificate',
                addressProof: 'Address Proof',
                bankAccountProof: 'Bank Account Proof',
                other1: 'Other Document 1',
                other2: 'Other Document 2',
                other3: 'Other Document 3'
              };

              return (
                <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <p className="font-medium mb-2">{labels[key]}</p>
                  <p className="text-sm text-gray-600 mb-3 truncate">{value}</p>
                  <button
                    onClick={() => handleDocumentDownload(value)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Associated Merchants (for franchise only) */}
      {isFranchise && renderMerchantsList(merchants)}

      {/* Parent Franchise Info (for merchants only) */}
      {!isFranchise && data.franchise && renderFranchiseInfo(data.franchise)}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        {data.createdAt && (
          <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
        )}
        {data.updatedAt && (
          <p>Last Updated: {new Date(data.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

// Helper component for displaying information items
const InfoItem = ({ icon, label, value, fullWidth = false }) => {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  );
};

export default ViewProfile;