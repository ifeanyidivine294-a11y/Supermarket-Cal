# Security Specification: Trusted SupermarketCal

## 1. Data Invariants

1. **Role Access Control (RBAC)**: Only the owner account (`chukwudebeifeanyi6@gmail.com`) can read or write product catalogue items, global settings, and audit/management analytics.
2. **Salesperson Isolation**: Salespeople can only read active products, record their own sales transactions atomically with their own `salespersonUid`, and read only their own past sales records. Salespeople are mathematically blocked from listing, querying, or reading another salesperson's transactions or overall supermarket sales reports.
3. **Immutable Identity**: A salesperson cannot change their `accountType` to `admin` or forge another user's UID on sales records.
4. **Historical Immutability**: Once a sale transaction is created, it cannot be modified or deleted by anyone, preserving financial audit integrity.
5. **Inventory Safety**: Product stock cannot be decremented below 0. Updates to stock quantity are strictly bounded.

## 2. The Dirty Dozen Payloads

1. **Spoofed Admin Registration**: User with UID `bad_actor` attempts to set `accountType: "admin"` in `/users/bad_actor`. Must be rejected unless email is verified `chukwudebeifeanyi6@gmail.com`.
2. **Cross-Employee Sales Snooping**: Cashier `user_b` attempts to read `/sales/sale_of_user_a`. Must return PERMISSION_DENIED.
3. **Malicious Price Manipulation**: Salesperson `user_b` sends a write to `/products/prod_coca_cola` altering `retailPrice` from 600 to 10. Must return PERMISSION_DENIED.
4. **Forged Salesperson UID in Sale**: User `user_b` creates a sale record with `salespersonUid: "user_a"`. Must return PERMISSION_DENIED.
5. **Unauthorized Sale Record Deletion**: Salesperson attempts to delete `/sales/sale_123` to hide a cash discrepancy. Must return PERMISSION_DENIED.
6. **Past Sale Mutation (Update Gap)**: Cashier attempts to update `grandTotal` on `/sales/sale_123` after customer payment. Must return PERMISSION_DENIED.
7. **Negative Quantity Attack**: A sale payload containing negative quantity `-5` to artificially inflate store stock. Must return PERMISSION_DENIED.
8. **Junk Field Injection (Shadow Update)**: User profile update adding undeclared ghost field `isSuperAdmin: true`. Must return PERMISSION_DENIED.
9. **Oversized String Injection (Denial of Wallet)**: Injecting 2MB string into `name` or `receiptNumber`. Must return PERMISSION_DENIED.
10. **Global Settings Hijacking**: Salesperson attempts to update `/settings/general` to change store currency or discount rules. Must return PERMISSION_DENIED.
11. **Orphan Inventory Movement**: Creating an inventory movement record with forged `performedBy` UID not matching `request.auth.uid`. Must return PERMISSION_DENIED.
12. **Unauthenticated Access**: Guest client querying `/sales` or `/products`. Must return PERMISSION_DENIED.
