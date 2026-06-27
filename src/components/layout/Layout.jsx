import { Outlet } from 'react-router'
import { useState } from 'react'
import { Info } from 'lucide-react'

import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

// Injected at build time by vite.config.js
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '—'
const BUILD_TIME  = typeof __BUILD_TIME__  !== 'undefined' ? __BUILD_TIME__  : null

function formatBuildTime(iso) {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  })
}

const BuildInfoBadge = () => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="fixed bottom-8 left-2 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip card — shown on hover */}
      {hovered && (
        <div className="absolute bottom-8 left-0 mb-1 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-2xl px-4 py-3 pointer-events-none">
          <p className="font-semibold text-gray-300 mb-2 uppercase tracking-wider text-[10px]">
            Build Info
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="font-mono font-medium text-green-400">v{APP_VERSION}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400 shrink-0">Built at</span>
              <span className="font-medium text-blue-300 text-right">{formatBuildTime(BUILD_TIME)}</span>
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* Trigger icon */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-indigo-600 text-gray-500 hover:text-white shadow transition-all duration-200"
        aria-label="Build info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

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

      {/* Build info badge — bottom-left corner */}
      <BuildInfoBadge />
    </div>
  )
}

export default Layout
