import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  User,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  Wallet,
  Ticket
} from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import logoImage from '../../assets/SD-2.jpg';
import ChangePasswordModal from './ChangePasswordModal';

const Header = ({ userType }) => {
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  // Fetch profile dynamically
  const fetchProfile = async () => {
    try {
      if (userType === 'franchise') {
        const res = await api.get('/franchise/profile', {
          params: {
            email: userEmail
          }
        });
        setProfileData({
          name: res.data.franchiseName,
          email: res.data.contactPersonEmail,
          walletBalance: res.data.walletBalance,
          initials: res.data.franchiseName
            ? res.data.franchiseName.substring(0, 2).toUpperCase()
            : 'FR'
        });
        localStorage.setItem("customerId", res?.data?.id)
      } else if (userType === 'merchant') {
        const res = await api.get('/merchants/profile', {
          params: {
            email: userEmail
          }
        });
        setProfileData({
          name: res.data.businessName,
          email: res.data.contactPersonEmail,
          walletBalance: res.data.walletBalance,
          initials: res.data.businessName
            ? res.data.businessName.substring(0, 2).toUpperCase()
            : 'ME'
        });
        localStorage.setItem("customerId", res?.data?.id)
        // if merchant belongs to franchise, also store it for conditional rendering
        if (res.data.franchiseId) {
          localStorage.setItem("franchiseId", res.data.franchiseId);
        }
      } else {
        // Admin → no API call
        setProfileData({
          name: 'Admin User',
          email: userEmail,
          initials: 'AD'
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userType]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('customerId');
    localStorage.clear();

    // Force full page reload to reset router and all state
    window.location.href = '/login';
  };

  const handleOpenPasswordModal = () => {
    setShowUserMenu(false);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordChangeSuccess = () => {
    // Optional: Add any additional logic after successful password change
    // For example: show a toast notification
    console.log('Password changed successfully');
  };

  // Route → title mapping
  const getPageTitle = () => {
    const path = location.pathname;
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/dashboard/vendors': 'Vendor List',
      '/dashboard/vendors/add': 'Add Vendor',
      '/dashboard/vendors/rates': 'Vendor Rates',
      '/dashboard/inventory': 'Product List',
      '/dashboard/inventory/inventory': 'Inventory',
      '/dashboard/inventory/pricing': 'Product Pricing',
      '/dashboard/inventory/returns': 'Returns',
      '/dashboard/customers': 'Customer List',
      '/dashboard/customers/onboard': 'Customer Onboarding',
      '/dashboard/customers/admin-approval': 'Merchant Approval',
      '/dashboard/customers/assign-products': 'Product Assignment',
      '/dashboard/others/upload': 'File Upload',
      '/dashboard/others/charges': 'Charge Calculation',
      '/dashboard/reports': 'Reports',
      '/dashboard/payout': 'Payout',
      '/dashboard/credit-card-bill-payment': 'Credit Card'
    };
    return routeTitles[path] || 'Supply Chain Management';
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) return null;

    const breadcrumbMap = {
      dashboard: 'Dashboard',
      vendors: 'Vendors',
      products: 'Products',
      inventory: 'Inventory',
      customers: 'Customers',
      transactions: 'Transactions',
      reports: 'Reports',
      add: 'Add',
      rates: 'Rates',
      pricing: 'Pricing',
      inward: 'Inward',
      outward: 'Outward',
      returns: 'Returns',
      onboard: 'Onboard',
      'assign-products': 'Assign Products',
      'admin-approval': 'Approval',
      upload: 'Upload',
      charges: 'Charges'
    };

    return segments.map(seg => breadcrumbMap[seg] || seg).join(' > ');
  };

  return (
    <>
      <header className="ml-15 bg-gray-200 shadow-sm border-b border-gray-200 sticky top-0 z-10">

        <div className="flex items-center justify-between px-6 py-2">
          {/* Left Section */}
          <div className='flex'>
            <img
              src="https://tse1.explicit.bing.net/th/id/OIP.I5BlfjjUo-Nipl3YqCsNvQHaFW?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Logo"
              className="w-[55px] h-[50px] object-contain mx-auto rounded-xl mt-1 p-1 mr-2 bg-gray-500"
            />
            <div className="flex flex-col">

              <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
              {getBreadcrumb() && (
                <nav className="text-sm text-gray-500 mt-1">{getBreadcrumb()}</nav>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Wallet only for merchant/franchise */}
            {(userType === 'merchant' || userType === 'franchise') &&
              profileData?.walletBalance !== undefined && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <Wallet className="h-5 w-5 text-gray-600" />
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Wallet Balance</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{profileData.walletBalance?.toLocaleString() ?? '0'}
                    </p>
                  </div>
                </div>
              )}

            {/* User dropdown */}
            {profileData && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500  to-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {profileData.initials}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.name}
                    </p>
                    <p className="text-xs text-gray-500">{profileData.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {profileData.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profileData.email}
                      </p>
                    </div>
                    <div className="py-2">
                     {!["admin" , "super_admin"].includes(userType) && (<Link to="/dashboard/profile">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="h-4 w-4 mr-3" /> View Profile 
                      </button>
                     </Link>)}
                      <button
                        onClick={handleOpenPasswordModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-3" /> Change Password
                      </button>
                      <Link to="/dashboard/support-ticket">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          {["admin", "super_admin"].includes(userType) ? (
                            <>
                              <Ticket className="h-4 w-4 mr-3" />
                              Support Dashboard
                            </>
                          ) : (
                            <>
                              <HelpCircle className="h-4 w-4 mr-3" />
                              Help & Support
                            </>
                          )}
                        </button>
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showUserMenu && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        userEmail={userEmail}
        isFirstTimeLogin={false}
        onPasswordChangeSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
};

export default Header;