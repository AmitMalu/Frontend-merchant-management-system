// import { Navigate, useLocation } from 'react-router'

// const ProtectedRoute = ({ children }) => {
//   const location = useLocation()
  
//   // Check if user is authenticated
//   // You can replace this with your actual authentication logic
//   const isAuthenticated = () => {
//     const token = localStorage.getItem('authToken')
//     // Add more validation logic here (token expiry, etc.)
//     return token !== null
//   }

//   if (!isAuthenticated()) {
//     // Redirect to login page with return url
//     return <Navigate to="/login" state={{ from: location }} replace />
//   }

//   return children
// }

// export default ProtectedRoute


import { Navigate, useLocation } from 'react-router'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')

    // Both token and user_type must exist
    return token !== null && userType !== null
  }

  if (!isAuthenticated()) {
    // Clear localStorage if authentication fails
    localStorage.removeItem('authToken')
    localStorage.removeItem('userType')
    localStorage.removeItem('permissions')

    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute