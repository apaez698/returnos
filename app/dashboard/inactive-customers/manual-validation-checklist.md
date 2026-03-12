# Inactive Customers Manual Validation Checklist

## Preconditions

- Dev server is running with `npm run dev`.
- There are customers in the current business with mixed `last_visit_at` values.
- At least one customer has `last_visit_at = null`.
- At least one customer has `last_visit_at` older than 14 days.

## Functional Checks

1. Open `/dashboard/inactive-customers` and confirm title `Inactive Customers` is visible.
2. Confirm description indicates 14-day inactivity criteria.
3. Verify customers with last visit 14+ days ago are shown.
4. Verify customers with `last_visit_at = null` are shown.
5. Verify customers with recent visits (less than 14 days) are not shown.
6. Verify rows show: customer name, phone, points, last visit date, and inactive days.
7. Verify list order is descending by days inactive (including `null` last visit first as `∞`).
8. Force a data loading failure and confirm the error state appears.

## Empty State Checks

1. Use data where all customers are active (< 14 days).
2. Confirm empty state message appears and table rows are not shown.

## Dashboard Summary Checks

1. Open `/dashboard` and confirm `Inactive Customers` summary section is visible.
2. Confirm it shows at most 5 customers.
3. Confirm `View all` link points to `/dashboard/inactive-customers`.
4. With no inactive customers, confirm `No inactive customers right now.` message appears.

## UX Checks

1. Validate layout on mobile width (375px) with no horizontal overflow in summary section.
2. Validate list page on mobile width and desktop width for readability.
