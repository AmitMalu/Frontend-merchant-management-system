import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home,
  Users,
  Package,
  DollarSign,
  UserPlus,
  ArrowDown,
  Calculator,
  Upload,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  CreditCard,
  Store,
  Banknote,
  Coins,
  Eye,
  Package2,
  IndianRupee,
  Ticket,
  RouterIcon,
  Layers,
  PercentDiamond,
  IdCard,
  SlidersHorizontal
} from 'lucide-react';
import { flattenPermissions } from "./permissionHelper";
import logoImage from '../../assets/SD-2.jpg';

// ============================================================================
// CONSTANTS - Single source of truth
// ============================================================================

const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  FRANCHISE: 'franchise',
  MERCHANT: 'merchant'
};

const MENU_KEYS = {
  DASHBOARD: 'dashboard',
  VENDORS: 'vendors',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  PAYMENT: 'payment',
  OTHER: 'other',
  REPORTS: 'reports',
  MERCHANTS: 'merchants',
  PAYOUT: 'payout',
  BILL_PAYMENT: 'payment',
  CARD_DETAILS: 'card-details',
  FUNDING: 'funding'
};

const MENU_TITLES = {
  DASHBOARD: 'DashBoard',
  ADMIN_MANAGEMENT: 'Admin Management',
  LOGS: 'Logs',
  TAXES_MANAGE: 'Taxes Manage',
  EDIT_HISTORY: 'Edit History',
  WALLET_ADJUSTMENT: 'Wallet Adjustment',
  MY_PERMISSIONS: 'My Permissions'
};

const USER_TYPE_DISPLAY = {
  [USER_TYPES.ADMIN]: 'Admin Panel',
  [USER_TYPES.SUPER_ADMIN]: 'Admin Panel',
  [USER_TYPES.FRANCHISE]: 'Franchise Portal',
  [USER_TYPES.MERCHANT]: 'Merchant Portal',
  default: 'Management System'
};

// All permissions for super admin
const SUPER_ADMIN_PERMISSIONS = new Set([
  'Dashboard', 'Admin Management', 'Logs', 'Taxes Manage', 'Edit History', 'Wallet Adjustment',
  'Vendors', 'Vendor List', 'Product List', 'Vendor Rates', 'Vendor Routing',
  'Inventory', 'Pricing Scheme', 'Product Scheme Assign', 'Inventory Management',
  'Customers', 'Customer List', 'Onboard Customer', 'Merchant Approval', 'Products Distribution',
  'Payment', 'Payment Products', 'Payment Charges', 'Payment Vendors', 'Payment Vendors Credentials', 'Payment Vendor Routing',
  'Other', 'File Upload', 'Charge Calculation', 'Batch Status', 'Prefund Authorization', 'Merchant Settings',
  'Reports'
]);

// Dashboard children configurations
const DASHBOARD_CHILDREN_CONFIG = {
  base: [
    { title: MENU_TITLES.DASHBOARD, path: '/dashboard', icon: Users, permission: 'Dashboard' }
  ],
  [USER_TYPES.SUPER_ADMIN]: [
    { title: MENU_TITLES.ADMIN_MANAGEMENT, path: '/dashboard/role-management', icon: Users, permission: 'Admin Management' },
    { title: MENU_TITLES.LOGS, path: '/dashboard/logs', icon: Users, permission: 'Logs' },
    { title: MENU_TITLES.TAXES_MANAGE, path: '/dashboard/taxes-management', icon: IndianRupee, permission: 'Taxes Management' },
    { title: MENU_TITLES.EDIT_HISTORY, path: '/dashboard/edit-history', icon: Users, permission: 'Edit History' },
    { title: MENU_TITLES.WALLET_ADJUSTMENT, path: '/dashboard/wallet-adjustment', icon: Users, permission: 'Wallet Adjustment' }
  ],
  [USER_TYPES.ADMIN]: [
    { title: MENU_TITLES.MY_PERMISSIONS, path: '/dashboard/role-management', icon: Users, permission: 'My Permissions' }
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const hasPermission = (permissionSet, permissionName) => {
  return permissionSet.has(permissionName);
};

const getPermissionsFromStorage = () => {
  try {
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      const permissions = JSON.parse(storedPermissions);
      return flattenPermissions(permissions);
    }
    return new Set(['Dashboard']);
  } catch (error) {
    console.error('Error parsing permissions from localStorage:', error);
    return new Set(['Dashboard']);
  }
};

const createPermissionSet = (userType) => {
  if (userType === USER_TYPES.SUPER_ADMIN) {
    return SUPER_ADMIN_PERMISSIONS;
  }

  if (userType === USER_TYPES.ADMIN) {
    return getPermissionsFromStorage();
  }

  return new Set();
};

const getDashboardChildren = (userType) => {
  const baseChildren = [...DASHBOARD_CHILDREN_CONFIG.base];

  if (userType === USER_TYPES.SUPER_ADMIN) {
    return [...baseChildren, ...DASHBOARD_CHILDREN_CONFIG[USER_TYPES.SUPER_ADMIN]];
  }

  if (userType === USER_TYPES.ADMIN) {
    return [...baseChildren, ...DASHBOARD_CHILDREN_CONFIG[USER_TYPES.ADMIN]];
  }

  return baseChildren;
};

const filterChildrenByPermissions = (children, permissionSet, parentKey) => {
  return children.filter(child => {
    // Skip permission check for Reports children
    if (parentKey === MENU_KEYS.REPORTS) return true;
    return hasPermission(permissionSet, child.permission || child.title);
  });
};

const shouldShowDashboardChild = (child, userType) => {
  if (child.title === MENU_TITLES.DASHBOARD) return true;

  const superAdminOnlyTitles = [
    MENU_TITLES.ADMIN_MANAGEMENT,
    MENU_TITLES.LOGS,
    MENU_TITLES.TAXES_MANAGE,
    MENU_TITLES.EDIT_HISTORY,
    MENU_TITLES.WALLET_ADJUSTMENT
  ];

  if (superAdminOnlyTitles.includes(child.title)) {
    return userType === USER_TYPES.SUPER_ADMIN;
  }

  if (child.title === MENU_TITLES.MY_PERMISSIONS) {
    return userType === USER_TYPES.ADMIN;
  }

  return true;
};

const filterMenuItemsByPermissions = (menuItems, permissionSet, userType) => {
  return menuItems.reduce((acc, item) => {
    // Handle Dashboard parent - always show for all admin types
    if (item.key === MENU_KEYS.DASHBOARD) {
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          if (!shouldShowDashboardChild(child, userType)) return false;
          return hasPermission(permissionSet, child.permission || child.title);
        });

        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }

    // For other menu items with children
    if (item.children) {
      const filteredChildren = filterChildrenByPermissions(
        item.children,
        permissionSet,
        item.key
      );

      if (filteredChildren.length > 0) {
        acc.push({ ...item, children: filteredChildren });
      }
      return acc;
    }

    // For items without children
    if (hasPermission(permissionSet, item.permission || item.title)) {
      acc.push(item);
    }

    return acc;
  }, []);
};

// ============================================================================
// MENU CONFIGURATIONS
// ============================================================================

const ADMIN_MENU_CONFIG = (userType) => [
  {
    title: 'Dashboard',
    key: MENU_KEYS.DASHBOARD,
    icon: Home,
    iconColor: '',
    permission: 'Dashboard',
    children: getDashboardChildren(userType)
  },
  {
    title: 'Vendors',
    key: MENU_KEYS.VENDORS,
    icon: Users,
    iconColor: '',
    permission: 'Vendors',
    children: [
      { title: 'Vendor List', path: '/dashboard/vendors', icon: Users, permission: 'Vendor List' },
      { title: 'Product List', path: '/dashboard/inventory', icon: Package, permission: 'Product List' },
      { title: 'Vendor Rates', path: '/dashboard/vendors/rates', icon: DollarSign, permission: 'Vendor Rates' }
    ]
  },
  {
    title: 'Inventory',
    key: MENU_KEYS.INVENTORY,
    icon: Package,
    iconColor: '',
    permission: 'Inventory Management',
    children: [
      { title: 'Pricing Scheme', path: '/dashboard/inventory/pricing', icon: Calculator, permission: 'Pricing Scheme' },
      { title: 'Product Scheme Assign', path: '/dashboard/inventory/products-assign', icon: Calculator, permission: 'Product Scheme Assign' },
      { title: 'Inventory', path: '/dashboard/inventory/inventory', icon: ArrowDown, permission: 'Inventory' }
    ]
  },
  {
    title: 'Customers',
    key: MENU_KEYS.CUSTOMERS,
    icon: Users,
    iconColor: '',
    permission: 'Customers',
    children: [
      { title: 'Customer List', path: '/dashboard/customers', icon: Users, permission: 'Customer List' },
      { title: 'Onboard Customer', path: '/dashboard/customers/onboard', icon: UserPlus, permission: 'Onboard Customer' },
      { title: 'Merchant Approval', path: '/dashboard/customers/admin-approval', icon: UserPlus, permission: 'Merchant Approval' },
      { title: 'Products Distribution', path: '/dashboard/customers/products-distribution', icon: Package, permission: 'Products Distribution' }
    ]
  },
  {
    title: 'Payment',
    key: MENU_KEYS.PAYMENT,
    icon: Banknote,
    iconColor: '',
    permission: 'Payment',
    children: [
      { title: 'Payment Products', path: '/dashboard/payment/products', icon: Layers, permission: 'Payment Products' },
      { title: 'Payment Charges', path: '/dashboard/payment/charges', icon: PercentDiamond, permission: 'Payment Charges' },
      { title: 'Payment Vendors', path: '/dashboard/payment/payment-vendors', icon: Store, permission: 'Payment Vendors' },
      { title: 'Payment Vendors Credentials', path: '/dashboard/payment/payment-vendors-creds', icon: IdCard, permission: 'Payment Vendors Credentials' },
      { title: 'Payment Vendor Routing', path: '/dashboard/payment/payment-vendor-routing', icon: RouterIcon, permission: 'Payment Vendor Routing' }
    ]
  },
  {
    title: 'Other',
    key: MENU_KEYS.OTHER,
    icon: CreditCard,
    iconColor: '',
    permission: 'Other',
    children: [
      { title: 'File Upload', path: '/dashboard/others/upload', icon: Upload, permission: 'File Upload' },
      { title: 'Charge Calculation', path: '/dashboard/others/charges', icon: Calculator, permission: 'Charge Calculation' },
      { title: 'Batch Status', path: '/dashboard/others/batch-status', icon: Eye, permission: 'Batch Status' },
      { title: 'Prefund Authorization', path: '/dashboard/others/prefund-authorization', icon: Eye, permission: 'Prefund Authorization' },
      { title: 'Merchant Settings', path: '/dashboard/others/merchant-settings', icon: SlidersHorizontal, permission: 'Merchant Settings' }
    ]
  },
  {
    title: 'Reports',
    path: '/dashboard/reports',
    key: MENU_KEYS.REPORTS,
    icon: BarChart3,
    iconColor: '',
    permission: 'Reports',
    children: [
      { title: 'Franchise Reports', path: '/dashboard/reports/franchise', icon: BarChart3 },
      { title: 'Merchant Reports', path: '/dashboard/reports/merchant', icon: BarChart3 },
      { title: 'Vendor Reports', path: '/dashboard/reports/vendor', icon: BarChart3 },
      { title: 'Merchant Transaction Reports', path: '/dashboard/reports/merchant-transactions', icon: BarChart3 },
      { title: 'Franchise Transaction Report', path: '/dashboard/reports/franchise-transactions', icon: BarChart3 },
      { title: 'Inward Report', path: '/dashboard/reports/inward', icon: BarChart3 },
      { title: 'Outward Report', path: '/dashboard/reports/outward', icon: BarChart3 },
      { title: 'Return Report', path: '/dashboard/reports/return', icon: BarChart3 },
      { title: 'Product Reports', path: '/dashboard/reports/product', icon: BarChart3 },
      { title: 'Stock Reports', path: '/dashboard/reports/stock', icon: BarChart3 },
      { title: 'Settled Unsettled Reports', path: '/dashboard/reports/settled-unsettled', icon: BarChart3 },
      { title: 'Payout Transaction Reports', path: '/dashboard/reports/payout-transaction', icon: BarChart3 }
    ]
  }
];

const FRANCHISE_MENU_CONFIG = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    key: MENU_KEYS.DASHBOARD,
    iconColor: ''
  },
  {
    title: 'Merchants',
    key: MENU_KEYS.MERCHANTS,
    icon: Store,
    iconColor: '',
    children: [
      { title: 'Merchant List', path: '/dashboard/merchants', icon: Store },
      { title: 'Product Pricing Scheme', path: '/dashboard/inventory/products-assign', icon: Calculator }
    ]
  },
  {
    title: 'Inventory',
    key: MENU_KEYS.INVENTORY,
    icon: Package,
    iconColor: '',
    children: [
      { title: 'Inward Entry', path: '/dashboard/customers/inward-products', icon: Package },
      { title: 'Product List', path: '/dashboard/inventory/customer-products', icon: Package },
      { title: 'Product Distribution', path: '/dashboard/customers/products-distribution', icon: Package }
    ]
  },
  {
    title: 'Payout',
    key: MENU_KEYS.PAYOUT,
    path: '/dashboard/payout',
    icon: Coins,
    iconColor: ''
  },
  {
    title: 'Reports',
    path: '/dashboard/reports',
    key: MENU_KEYS.REPORTS,
    icon: BarChart3,
    iconColor: '',
    children: [
      { title: 'Merchant Transaction Reports', path: '/dashboard/reports/merchant-transactions', icon: BarChart3 },
      { title: 'Franchise Transaction Report', path: '/dashboard/reports/franchise-transactions', icon: BarChart3 }
    ]
  },
  {
    title: 'Funding',
    path: '/dashboard/funding',
    key: MENU_KEYS.FUNDING,
    icon: BarChart3,
    iconColor: '',
    children: [
      { title: 'Prefund Wallet', path: '/dashboard/funding/prefund-wallet', icon: BarChart3 },
      { title: 'Push Wallet', path: '/dashboard/funding/push-wallet', icon: BarChart3 }

    ]
  }
];

const MERCHANT_MENU_CONFIG = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    key: MENU_KEYS.DASHBOARD,
    icon: Home,
    iconColor: ''
  },
  {
    title: 'Inventory',
    key: MENU_KEYS.INVENTORY,
    icon: Package,
    iconColor: '',
    children: [
      { title: 'Inward Entry', path: '/dashboard/customers/inward-products', icon: Package },
      { title: 'Product List', path: '/dashboard/inventory/customer-products', icon: Package }
    ]
  },
  {
    title: 'Bill Payment',
    key: MENU_KEYS.BILL_PAYMENT,
    path: '/dashboard/credit-card-bill-payment',
    icon: Banknote,
    iconColor: ''
  },
  {
    title: 'Payout',
    key: MENU_KEYS.PAYOUT,
    path: '/dashboard/payout',
    icon: Coins,
    iconColor: ''
  },
  {
    title: 'Card Details',
    key: MENU_KEYS.CARD_DETAILS,
    icon: CreditCard,
    iconColor: ''
  },
  {
    title: 'Reports',
    path: '/dashboard/reports',
    key: MENU_KEYS.REPORTS,
    icon: BarChart3,
    iconColor: '',
    children: [
      { title: 'Merchant Transaction Reports', path: '/dashboard/reports/merchant-transactions', icon: BarChart3 }
    ]
  },
  {
    title: 'Funding',
    path: '/dashboard/funding',
    key: MENU_KEYS.FUNDING,
    icon: BarChart3,
    iconColor: '',
    children: [
      { title: 'Prefund Wallet', path: '/dashboard/funding/prefund-wallet', icon: BarChart3 }
    ]
  }
];

const getMenuItems = (userType) => {
  const normalizedUserType = userType === USER_TYPES.SUPER_ADMIN ? USER_TYPES.ADMIN : userType;

  if (normalizedUserType === USER_TYPES.ADMIN) {
    return ADMIN_MENU_CONFIG(userType);
  }

  if (normalizedUserType === USER_TYPES.FRANCHISE) {
    return FRANCHISE_MENU_CONFIG;
  }

  return MERCHANT_MENU_CONFIG;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const MenuItem = React.memo(({
  item,
  isActive,
  isParentActive,
  sidebarCollapsed,
  onMenuClick
}) => {
  const location = useLocation();

  const isActiveLink = (path) => location.pathname === path;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => onMenuClick(item.key)}
          className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 hover:bg-blue-100 group ${isParentActive ? 'bg-blue-100 border border-blue-500' : ''
            }`}
          aria-label={`${item.title} menu`}
          aria-expanded={isActive}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isParentActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
              } transition-colors duration-200`}>
              <item.icon className={`w-5 h-5 ${isParentActive ? 'text-blue-600' : item.iconColor || 'text-gray-600'
                }`} />
            </div>
            {!sidebarCollapsed && (
              <span className={`font-medium ${isParentActive ? 'text-blue-900' : 'text-gray-700'
                }`}>
                {item.title}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="transition-transform duration-200">
              {isActive ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </div>
          )}
        </button>

        {isActive && !sidebarCollapsed && (
          <div className="ml-6 mt-2 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActiveLink(child.path)
                  ? 'bg-gray-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                aria-label={child.title}
              >
                <child.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 group ${isActiveLink(item.path) ? 'bg-blue-50 border border-blue-200' : ''
        }`}
      aria-label={item.title}
    >
      <div className={`p-2 rounded-lg ${isActiveLink(item.path) ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
        } transition-colors duration-200`}>
        <item.icon className={`w-5 h-5 ${isActiveLink(item.path) ? 'text-blue-600' : item.iconColor || 'text-gray-600'
          }`} />
      </div>
      {!sidebarCollapsed && (
        <span className={`font-medium ${isActiveLink(item.path) ? 'text-blue-900' : 'text-gray-700'
          }`}>
          {item.title}
        </span>
      )}
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

const SidebarHeader = React.memo(({ sidebarCollapsed, onToggle, userType }) => {
  const displayText = USER_TYPE_DISPLAY[userType] || USER_TYPE_DISPLAY.default;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-200">
      {!sidebarCollapsed && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
            <img
              src="https://tse1.explicit.bing.net/th/id/OIP.I5BlfjjUo-Nipl3YqCsNvQHaFW?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Logo"
              className="w-[55px] h-[55px] object-contain mx-auto rounded-xl p-1 bg-gray-500"
            />
          </div>
          <div>
            <h1 className="text-xs font-bold text-gray-800">Merchant Management System</h1>
            <p className="text-xs text-gray-500">{displayText}</p>
          </div>
        </div>
      )}
      <button
        onClick={onToggle}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <Menu className="w-5 h-5 text-gray-600" />
        ) : (
          <X className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

const Sidebar = ({ userType }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const permissionSet = useMemo(() => createPermissionSet(userType), [userType]);

  const handleMouseLeave = () => {
    setSidebarCollapsed(true);
  };

  const handleMouseEnter = () => {
    setSidebarCollapsed(false);
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);

    if (!sidebarCollapsed) {
      setExpandedMenus({});
    }
  };

  const handleMenuClick = (menuKey) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setExpandedMenus(prev => ({
        ...prev,
        [menuKey]: true
      }));
    } else {
      toggleMenu(menuKey);
    }
  };

  const isActiveParent = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const menuItems = useMemo(() => {
    let items = getMenuItems(userType);

    if (userType === USER_TYPES.ADMIN || userType === USER_TYPES.SUPER_ADMIN) {
      items = filterMenuItemsByPermissions(items, permissionSet, userType);
    }

    return items;
  }, [userType, permissionSet]);

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-gray-200 shadow-xl transition-[width] duration-300 ease-out flex flex-col border-r border-gray-200 h-full overflow-hidden`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="w-64 flex flex-col h-full">
        <SidebarHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          userType={userType}
        />

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.key || item.path}>
                  <MenuItem
                    item={item}
                    isActive={expandedMenus[item.key]}
                    isParentActive={isActiveParent(item.children)}
                    sidebarCollapsed={sidebarCollapsed}
                    onMenuClick={handleMenuClick}
                  />
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {!sidebarCollapsed && "No permissions available"}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;