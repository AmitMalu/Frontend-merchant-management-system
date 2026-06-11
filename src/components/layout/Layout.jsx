import { Outlet } from 'react-router'

import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const Layout = () => {

  const userType = localStorage.getItem("userType").toLowerCase()
  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar - Positioned absolutely to overlay */}
      <div className="absolute inset-y-0 left-0 z-30 h-full">
        <Sidebar userType={userType} />
      </div>

      {/* Main Content Area - Takes full width */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <Header userType={userType} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pl-20 pt-6">
          <Outlet />
        </main>

        <div>
          {/* Footer */}
          <footer className="w-full text-center py-2 bg-white/30 backdrop-blur-md border-t border-gray-200 shadow-sm">
            <p className="text-gray-700 text-xs tracking-wide">
              © {new Date().getFullYear()} <span className="font-medium">Powered by Shashwat Infotech Pvt. Ltd.</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Layout