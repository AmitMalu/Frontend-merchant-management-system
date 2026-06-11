import { lazy } from 'react';
import React from 'react';
const Dashboard = lazy(() => import('../../components/DashBoards/Dashborad.jsx'));
const MerchantListComponent = lazy(() => import('../../components/Tables/MerchantList.jsx'));
const CustomerProductsList = lazy(() => import('../../components/Tables/CustomerProducts/CustomerProductsList.jsx'));
const ProductOutward = lazy(() => import('../../components/Tables/ProductOutward.jsx'));
const ProductDistributionList = lazy(() => import('../../components/Tables/ProductDistributionList.jsx'));
const FranchiseProductAssign_Scheme = lazy(() => import('../../components/Tables/FranchiseProductAssign_Scheme.jsx'));
const MTransReportDashboard = lazy(() => import('../../components/Reports/MerchantTransReport/MTransReportDashboard.jsx'));
const FTransReportDashboard = lazy(() => import('../../components/Reports/FranhiseTransReports/FTransReportDashboard.jsx'));
const Payout = lazy(() => import('../../components/Payout/Payout.jsx'));
const ViewProfile = lazy(() => import('../../components/layout/ViewProfile.jsx'));
const SupportTickets = lazy(() => import('../../components/Tables/SupportTicket.jsx'));
const PrefundWalletForm = lazy(() => import('../../components/Tables/PrefundWalletForm.jsx'));
const PushWalletForm = lazy(() => import('../../components/Tables/PushWalletForm.jsx'));


export const franchiseRoutes = [
  {
    index: true,
    element: <Dashboard />
  },
  {
    path: 'merchants',
    element: <MerchantListComponent />
  },
  {
    path: 'customers',
    children: [
      {
        path: 'inward-products',
        element: <ProductOutward />
      },
      {
        path: 'products-distribution',
        element: <ProductDistributionList />
      }
    ]
  },
  {
    path: 'inventory',
    children: [
      {
        path: 'customer-products',
        element: <CustomerProductsList />
      },
      {
        path: 'products-assign',
        element: <FranchiseProductAssign_Scheme />
      }
    ]
  },
  {
    path: 'payout',
    element: <Payout />
  },
  {
    path: 'profile',
    element: <ViewProfile />
  },
   {
    path: 'support-ticket',
    element: <SupportTickets />
  },
  {
    path: 'reports',
    children: [
      {
        path: "merchant-transactions",
        element: <MTransReportDashboard />
      },
      {
        path: "franchise-transactions",
        element: <FTransReportDashboard />
      }
    ]
  },
  {
  path: 'funding',
  children: [
    {
      path: 'prefund-wallet',
      element: <PrefundWalletForm />
    },
    {
      path: 'push-wallet',
      element: <PushWalletForm />
    }
  ]
}
]