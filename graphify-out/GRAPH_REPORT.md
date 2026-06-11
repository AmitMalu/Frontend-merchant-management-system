# Graph Report - frontend  (2026-05-28)

## Corpus Check
- 167 files · ~145,702 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 640 nodes · 811 edges · 55 communities (43 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ead5d1a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `formatCurrency()` - 9 edges
2. `scripts` - 5 edges
3. `CandidatesTable()` - 5 edges
4. `formatNumber()` - 5 edges
5. `useBatch()` - 5 edges
6. `useBeforeUnload()` - 5 edges
7. `FormInput()` - 5 edges
8. `Button()` - 5 edges
9. `ProductList()` - 5 edges
10. `VendorRateList()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `VendorRateView()` --calls--> `formatCurrency()`  [INFERRED]
  src/components/View/VendorRateView.jsx → src/components/Charge Settlement/formatters.js
- `VendorRateView()` --calls--> `formatDate()`  [INFERRED]
  src/components/View/VendorRateView.jsx → src/components/Charge Settlement/formatters.js
- `ViewModal()` --calls--> `handleApiError()`  [EXTRACTED]
  src/components/Tables/CustomerList.jsx → src/constants/API/customerApi.js
- `CustomerListComponent()` --calls--> `handleApiError()`  [EXTRACTED]
  src/components/Tables/CustomerList.jsx → src/constants/API/customerApi.js
- `BusinessLogs()` --calls--> `getLogColumns()`  [EXTRACTED]
  src/components/Admin/BusinessLogs.jsx → src/config/logColumns.jsx

## Communities (55 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (3): getAllInwardTransactions(), productReportApi, InwardTransactionReport()

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (10): inwardAPI, createOutwardTransaction(), deleteOutwardTransaction(), getAllOutwardTransactions(), updateOutwardTransaction(), returnTransactionAPI, outwardSchema, returnSchema (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (43): dependencies, axios, clsx, date-fns, formik, @hookform/resolvers, jspdf, jspdf-autotable (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (42): AdminApproval, AdminRolesDashboard, AdminSupportTickets, AuditHistoryComponent, BusinessLogs, CustomerListComponent, CustomerOnboarding, CustomerProductsList (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (12): formSchema, vendorRuleSchema, PaymentChargesForm, PaymentChargesView, PaymentProductsForm, PaymentProductsView, PaymentVendorCredentialsForm, PaymentVendorCredentialsView (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (15): CandidatesTable(), DirectSettlementPage(), formatCurrency(), formatDate(), formatNumber(), formatPercentage(), truncateText(), FranchiseSettlementPage() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (6): createProduct(), deleteProduct(), getProducts(), updateProduct(), productSchema, ProductList()

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (9): BankDetailsForm(), BasicDetailsForm(), ContactDetailsForm(), CustomerTypeSelection(), DocumentPreview(), DocumentsForm(), FILE_CONSTRAINTS, FranchiseSelectionForm() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (16): flattenPermissions(), ADMIN_MENU_CONFIG(), createPermissionSet(), DASHBOARD_CHILDREN_CONFIG, FRANCHISE_MENU_CONFIG, getDashboardChildren(), getMenuItems(), getPermissionsFromStorage() (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (4): vendorApi, BANK_TYPE_OPTIONS, DEFAULT_VALUES, vendorSchema

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (9): businessTypeMap, customerApi, fileApi, franchiseApi, handleApiError(), merchantApi, CustomerListComponent(), DocumentPreview() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (5): createVendorRate(), deleteVendorRate(), getAllVendorRates(), updateVendorRate(), VendorRateList()

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (10): adminRoutes, App, ErrorPage, ForgotPassword, Layout, Login, ProtectedRoute, ResetPassword (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (13): CustomerProductsList, Dashboard, franchiseRoutes, FTransReportDashboard, MerchantListComponent, MTransReportDashboard, Payout, PrefundWalletForm (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): CreditCardBillPayment, CustomerProductsList, Dashboard, MainReportsPageForNow, merchantRoutes, MTransReportDashboard, Payout, PrefundWalletForm (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (4): BusinessLogs(), getLogColumns(), filterOptions, tableOptions

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (4): inwardSchema, GridCell, GridRow, SERIAL_FIELDS

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (3): defaultForm, formSchema, slabSchema

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): DocumentGroupContainers, Documents, Version, WorkspaceRootPath

## Knowledge Gaps
- **173 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `private`, `version` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05357142857142857 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._