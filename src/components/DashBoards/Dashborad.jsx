
// import AdminDashboard from './AdminDashboard';
// import CustomerDashboard from './CustomerDashboard';


// // Main Dashboard Component
// const Dashboard = () => {
//   const userType = localStorage.getItem("userType").toLowerCase()
  



//   // Main render logic based on user type
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {['admin', 'super_admin'].includes(userType) ? (
//         <AdminDashboard />
//       ) : (
//         <CustomerDashboard userType={userType} />
//       )}
//     </div>
//   );
// };

// export default Dashboard;


// import React, { useEffect, useState } from 'react';
// import AdminDashboard from './AdminDashboard';
// import CustomerDashboard from './CustomerDashboard';
// import ChangePasswordModal from '../layout/ChangePasswordModal';

// // Main Dashboard Component
// const Dashboard = () => {
//   const userType = localStorage.getItem("userType")?.toLowerCase();
//   const userEmail = localStorage.getItem("userEmail") || "";
//   const [showPasswordModal, setShowPasswordModal] = useState(false);

//   useEffect(() => {
//     // Check if user is logging in for the first time
//     const firstLogin = localStorage.getItem("firstLogin");

//     // Show modal if firstLogin is "true" (string comparison)
//     if (firstLogin === "true") {
//       setShowPasswordModal(true);
//     }
//   }, []);

//   const handlePasswordChangeSuccess = () => {
//     // Update the firstLogin flag to false after successful password change
//     // Backend has already updated the database, so we just update localStorage
//     localStorage.setItem("firstLogin", "false");

//     // Close the modal
//     setShowPasswordModal(false);

//     // Optional: Show success toast
//     // toast.success('Password changed successfully! You can now access the dashboard.');
//   };

//   const handleModalClose = () => {
//     // Prevent closing modal for first-time login
//     // User must change password to proceed
//     console.log('Password change is mandatory for first-time login');
//   };

//   // Main render logic based on user type
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {['admin', 'super_admin'].includes(userType) ? (
//         <AdminDashboard />
//       ) : (
//         <CustomerDashboard userType={userType} />
//       )}

//       {/* First Time Login Password Change Modal */}
//       <ChangePasswordModal
//         isOpen={showPasswordModal}
//         onClose={handleModalClose}
//         userEmail={userEmail}
//         isFirstTimeLogin={true}
//         onPasswordChangeSuccess={handlePasswordChangeSuccess}
//       />
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import ChangePasswordModal from '../layout/ChangePasswordModal';
import PasswordExpiryWarningBanner from '../layout/PasswordExpiryWarningBanner';

const Dashboard = () => {
  const userType = localStorage.getItem("userType")?.toLowerCase();
  const userEmail = localStorage.getItem("userEmail") || "";
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [expiryWarningMessage, setExpiryWarningMessage] = useState("");
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // ✅ Check for first-time login
    const firstLogin = localStorage.getItem("firstLogin");
    if (firstLogin === "true") {
      setShowPasswordModal(true);
      return; // Don't show expiry warning if forcing password change
    }

    // ✅ Check for password expiry warning
    const warningMessage = localStorage.getItem("passwordExpiryWarning");
    const daysLeftStr = localStorage.getItem("daysLeftForPasswordExpiry");

    if (warningMessage && daysLeftStr) {
      setExpiryWarningMessage(warningMessage);
      setDaysLeft(parseInt(daysLeftStr));
      setShowExpiryWarning(true);
    }
  }, []);

  const handlePasswordChangeSuccess = () => {
    localStorage.setItem("firstLogin", "false");
    setShowPasswordModal(false);

    // ✅ Clear expiry warning after password change
    localStorage.removeItem("passwordExpiryWarning");
    localStorage.removeItem("daysLeftForPasswordExpiry");
    setShowExpiryWarning(false);
  };

  const handleModalClose = () => {
    // Prevent closing modal for first-time login
    console.log('Password change is mandatory for first-time login');
  };

  const handleDismissWarning = () => {
    // ✅ Dismiss warning banner
    setShowExpiryWarning(false);
    localStorage.removeItem("passwordExpiryWarning");
    localStorage.removeItem("daysLeftForPasswordExpiry");
  };

  const handleChangePasswordFromWarning = () => {
    // ✅ Open change password modal from warning banner
    setShowExpiryWarning(false);
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Password Expiry Warning Banner - Shows at top */}
      {showExpiryWarning && !showPasswordModal && (
        <PasswordExpiryWarningBanner
          message={expiryWarningMessage}
          daysLeft={daysLeft}
          onDismiss={handleDismissWarning}
          onChangePassword={handleChangePasswordFromWarning}
        />
      )}

      {/* Main Dashboard Content */}
      {['admin', 'super_admin'].includes(userType) ? (
        <AdminDashboard />
      ) : (
        <CustomerDashboard userType={userType} />
      )}

      {/* Password Change Modal - For first login or manual change */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={showPasswordModal && localStorage.getItem("firstLogin") === "true"
          ? handleModalClose
          : () => setShowPasswordModal(false)}
        userEmail={userEmail}
        isFirstTimeLogin={localStorage.getItem("firstLogin") === "true"}
        onPasswordChangeSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default Dashboard;