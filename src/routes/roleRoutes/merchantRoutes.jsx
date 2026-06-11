import { lazy } from 'react';
import React from 'react';

const Dashboard = lazy(() => import('../../components/DashBoards/Dashborad.jsx'));
const CustomerProductsList = lazy(() => import('../../components/Tables/CustomerProducts/CustomerProductsList.jsx'));
const ProductOutward = lazy(() => import('../../components/Tables/ProductOutward.jsx'));
const MainReportsPageForNow = lazy(() => import('../../components/Reports/MainReportsPageForNow.jsx'));
const Payout = lazy(() => import('../../components/Payout/Payout.jsx'));
const CreditCardBillPayment = lazy(() => import('../../components/Payout/CreditCardBillPayment.jsx'));
const MTransReportDashboard = lazy(() => import('../../components/Reports/MerchantTransReport/MTransReportDashboard.jsx'));
const ViewProfile = lazy(() => import('../../components/layout/ViewProfile.jsx'));
const SupportTickets = lazy(() => import('../../components/Tables/SupportTicket.jsx'));
const PrefundWalletForm = lazy(() => import('../../components/Tables/PrefundWalletForm.jsx'));


export const merchantRoutes = [
  {
    index: true,
    element: <Dashboard />
  },
  {
    path: 'customers',
    children: [
      {
        path: 'inward-products',
        element: <ProductOutward />
      }
    ]
  },
  {
    path: 'inventory',
    children: [
      {
        path: 'customer-products',
        element: <CustomerProductsList />
      }
    ]
  },
  {
    path: 'credit-card-bill-payment',
    element: <CreditCardBillPayment />
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
      }
    ]
  },
  {
    path: 'funding',
    children: [
      {
        path: 'prefund-wallet',
        element: <PrefundWalletForm />
      }
    ]
  }
]