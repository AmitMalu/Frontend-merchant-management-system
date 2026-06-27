# Requirements Document

## Introduction

This feature adds a **Lien Amount Form** to the Admin module, rendered below the existing `PrefundAuthorization` component on the `dashboard/others/prefund-authorization` route. The form allows admins to select a merchant (via customer type and optional franchise cascading dropdowns), enter a lien amount, set payout and credit card bill payment flags, and submit the configuration to the backend. The component follows existing patterns established by `SettlementBatchStatusMonitor` and `WalletAdjustment`.

## Glossary

- **LienAmountForm**: The new React component located at `src/components/Admin/LienAmountForm.jsx`.
- **Customer_Type**: A classification that determines the merchant lookup flow — either `"franchise"` or `"direct"`.
- **Franchise**: A top-level customer entity with an associated list of merchants, fetched from `GET /franchise`.
- **Direct_Merchant**: A merchant entity not linked to a franchise, fetched from `GET /merchants/direct-merchant`.
- **Franchise_Merchant**: A merchant entity under a franchise, fetched from `GET /merchants/franchise/{franchiseId}`.
- **Merchant**: The end entity on which the lien amount and flags are applied.
- **Lien_Amount**: A positive numeric value (greater than 0) entered by the admin to restrict or reserve a portion of the merchant's funds.
- **Payout_Flag**: A boolean toggle that enables or disables payout processing for the selected merchant.
- **CC_Bill_Payment_Flag**: A boolean toggle that enables or disables credit card bill payment processing for the selected merchant.
- **API**: The Axios instance imported from `../../constants/API/axiosInstance`.
- **Toast**: The `react-toastify` notification system already installed in the project.

---

## Requirements

### Requirement 1: Customer Type Selection

**User Story:** As an admin, I want to select a customer type (Franchise or Direct Merchant), so that the form shows the correct downstream dropdowns for merchant selection.

#### Acceptance Criteria

1. THE LienAmountForm SHALL render a "Customer Type" dropdown with an empty default option ("Select type...") and two named options: "Direct Merchant" (value `"direct"`) and "Franchise" (value `"franchise"`).
2. WHEN the admin selects "Franchise" from the Customer_Type dropdown, THE LienAmountForm SHALL render a franchise dropdown below the Customer_Type dropdown, populated with the already-loaded franchise list.
3. WHEN the admin selects "Direct Merchant" from the Customer_Type dropdown, THE LienAmountForm SHALL render the merchant dropdown populated with the already-loaded direct merchant list; no franchise dropdown SHALL be rendered.
4. WHEN the admin changes the Customer_Type selection from one non-empty value to another, THE LienAmountForm SHALL reset: the franchise selection to empty, the merchant selection to empty, the lien amount field to an empty string, and the Payout_Flag and CC_Bill_Payment_Flag to `false`.
5. WHILE the initial data fetch (mount-time) is in progress, THE LienAmountForm SHALL disable the Customer_Type dropdown until both `GET /franchise` and `GET /merchants/direct-merchant` have settled (succeeded or failed).

---

### Requirement 2: Franchise and Merchant Data Loading

**User Story:** As an admin, I want the form to automatically load the relevant franchise and merchant lists from the backend, so that I can select the correct merchant without manual input.

#### Acceptance Criteria

1. WHEN the LienAmountForm mounts, THE API SHALL fetch the franchise list from `GET /franchise` and the direct merchant list from `GET /merchants/direct-merchant` as two independent requests, such that the result of one request does not block or cancel the other.
2. WHEN the admin selects a franchise from the franchise dropdown, THE API SHALL fetch the merchant list from `GET /merchants/franchise/{franchiseId}` using the selected franchise's `id`.
3. WHILE a data fetch is in progress, THE LienAmountForm SHALL disable only the dropdown(s) whose data is being loaded: the franchise dropdown SHALL be disabled while `GET /franchise` is in progress; the merchant dropdown SHALL be disabled while `GET /merchants/direct-merchant` or `GET /merchants/franchise/{franchiseId}` is in progress; all other dropdowns SHALL remain enabled.
4. IF a fetch of `GET /franchise` fails, THEN THE LienAmountForm SHALL display a Toast error notification with `error.response.data.message` if present, or the fallback message `"Failed to load franchises"` if not, and SHALL set the franchise list to an empty array.
5. IF a fetch of `GET /merchants/direct-merchant` or `GET /merchants/franchise/{franchiseId}` fails, THEN THE LienAmountForm SHALL display a Toast error notification with `error.response.data.message` if present, or the fallback message `"Failed to load merchants"` if not, and SHALL set the affected merchant list to an empty array.
6. IF one of the two parallel mount-time fetches fails and the other succeeds, THEN THE LienAmountForm SHALL display a Toast error notification for the failed fetch and SHALL populate the dropdown for the succeeded fetch with the returned data.

---

### Requirement 3: Merchant Dropdown Population

**User Story:** As an admin, I want the merchant dropdown to reflect the correct list based on my customer type and franchise selection, so that I can apply the lien to the right merchant.

#### Acceptance Criteria

1. WHILE Customer_Type is `"direct"` and the direct merchant list is non-empty, THE LienAmountForm SHALL render the merchant dropdown populated with the list fetched from `GET /merchants/direct-merchant`.
2. WHILE Customer_Type is `"franchise"` and a franchise is selected and the franchise merchant list is non-empty, THE LienAmountForm SHALL render the merchant dropdown populated with the list fetched from `GET /merchants/franchise/{franchiseId}`.
3. WHILE the relevant merchant list is empty (`[]`), unavailable (fetch failed), or a prerequisite selection is absent (Customer_Type is `"franchise"` but no franchise is selected), THE LienAmountForm SHALL NOT render the merchant dropdown.
4. WHERE the merchant dropdown is rendered, THE LienAmountForm SHALL display each merchant option as `{merchant.businessName} - {merchant.contactPersonName}` with `merchant.id` as the option value.
5. WHEN the admin changes the franchise selection, THE LienAmountForm SHALL reset the merchant selection to empty before fetching the new franchise merchant list.

---

### Requirement 4: Lien Amount Input

**User Story:** As an admin, I want to enter a numeric lien amount for the selected merchant, so that I can configure the financial restriction accurately.

#### Acceptance Criteria

1. THE LienAmountForm SHALL render a text input field with the label "Lien Amount" and a `"₹"` prefix symbol visually adjacent (left-aligned) to the input.
2. WHEN the admin types in the lien amount field, THE LienAmountForm SHALL reject any character that is not a digit (`0–9`) or a single decimal point, preventing invalid characters from being entered into the field.
3. THE LienAmountForm SHALL permit at most one decimal point in the lien amount field; a second decimal point SHALL NOT be accepted.
4. IF the admin submits the form and the lien amount is empty, zero, or less than zero, THEN THE LienAmountForm SHALL display an inline validation error message adjacent to the lien amount field reading `"Lien amount must be greater than 0"` and SHALL NOT call the submission API.

---

### Requirement 5: Payout and Credit Card Bill Payment Flags

**User Story:** As an admin, I want to toggle the payout and credit card bill payment flags for the selected merchant, so that I can enable or disable those features as part of the lien configuration.

#### Acceptance Criteria

1. THE LienAmountForm SHALL render a checkbox or toggle control labeled "Payout" with an initial checked/enabled state of `false`.
2. THE LienAmountForm SHALL render a checkbox or toggle control labeled "Credit Card Bill Payment" with an initial checked/enabled state of `false`.
3. WHEN the admin checks or unchecks the Payout control, THE LienAmountForm SHALL update the `payoutEnabled` state to the new boolean value immediately.
4. WHEN the admin checks or unchecks the CC_Bill_Payment control, THE LienAmountForm SHALL update the `ccBillPaymentEnabled` state to the new boolean value immediately.
5. THE two flag controls SHALL be independent — changing one SHALL NOT affect the other.

---

### Requirement 6: Form Submission

**User Story:** As an admin, I want to submit the lien amount and flags to the backend for the selected merchant, so that the configuration is persisted and applied.

#### Acceptance Criteria

1. THE LienAmountForm SHALL render a "Submit" button that is enabled only when a merchant is selected and the lien amount is a positive number.
2. WHEN the admin clicks "Submit" with a valid merchant selected and a valid lien amount entered, THE API SHALL send a `POST` request to `/merchants/{merchantId}/lien` with a JSON body of `{ lienAmount: number, payoutEnabled: boolean, ccBillPaymentEnabled: boolean }`, where `merchantId` is the `id` of the selected merchant.
3. WHILE the submission request is in progress, THE LienAmountForm SHALL set the Submit button to a disabled state and display the label "Submitting..." to prevent duplicate submissions.
4. WHEN the submission request returns a 2xx response, THE LienAmountForm SHALL display a Toast success notification with the message `"Lien amount applied successfully"` and SHALL reset only the lien amount field to empty string and both flags to `false`; the merchant and customer type selections SHALL remain unchanged.
5. IF the submission request returns an error response, THEN THE LienAmountForm SHALL display a Toast error notification with `error.response.data.message` if present, or the fallback message `"Failed to apply lien amount"` if not, and SHALL NOT reset any form fields.
6. IF the admin clicks "Submit" and no merchant is selected, THEN THE LienAmountForm SHALL display an inline validation error message reading `"Please select a merchant"` and SHALL NOT send the API request.

---

### Requirement 7: Form Reset

**User Story:** As an admin, I want to reset the form to its initial state, so that I can start a new lien configuration without refreshing the page.

#### Acceptance Criteria

1. THE LienAmountForm SHALL render a "Reset" button that is always enabled regardless of form state.
2. WHEN the admin clicks "Reset", THE LienAmountForm SHALL set: Customer_Type to empty string, franchise selection to empty string, merchant selection to empty string, lien amount to empty string, `payoutEnabled` to `false`, and `ccBillPaymentEnabled` to `false`.
3. WHEN the admin clicks "Reset", THE LienAmountForm SHALL NOT trigger any API calls, and the already-loaded franchise and direct merchant lists SHALL be preserved in state.

---

### Requirement 8: Integration with PrefundAuthorization Page

**User Story:** As an admin, I want the Lien Amount Form to appear on the same page as PrefundAuthorization, so that related admin operations are co-located.

#### Acceptance Criteria

1. THE `PrefundAuthorization` component SHALL import and render `LienAmountForm` as a child element positioned after (below) the existing prefund authorization table and pagination in the JSX tree.
2. THE LienAmountForm section SHALL be visually separated from the PrefundAuthorization section by a top margin or divider, and SHALL include a section heading (e.g., "Lien Amount Configuration") using styling consistent with the `h2` heading in `PrefundAuthorization`.
3. THE LienAmountForm SHALL be a fully self-contained component: it SHALL manage its own state, its own API calls, and its own Toast notifications without sharing or modifying any state owned by `PrefundAuthorization`.
