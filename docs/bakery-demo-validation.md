# Bakery Demo Validation Guide

Manual step-by-step guide for validating the full ReturnOS bakery demo flow after seeding.

**Reference Date**: March 12, 2026

## Prerequisites

- Bakery demo dataset has been seeded to Supabase
- Dev server is running (`npm run dev`)
- You have access to the business owner login (email: any valid email you can use for magic link)
- Browser is logged in and authenticated

---

## Expected Demo Business

### Business Details

- **Name**: Café & Pastelería Delicia
- **Slug**: cafeteria-delicia
- **Type**: Bakery/Cafeteria
- **Created**: 1 year ago (365 days from March 12, 2026)

### Dataset Summary

- **20 Customers**: 5 frequent, 5 regular, 5 inactive, 5 new
- **95 Visits**: Realistic transactions spanning 365 days
- **775 Points Issued**: Across all customers
- **Average Purchase**: ~$6.85
- **Total Sales**: ~$650

---

## Part 1: Navigate to Dashboard

1. Go to `/dashboard`
2. Confirm you see the main dashboard layout
3. Verify the business name "Café & Pastelería Delicia" is displayed (usually in header or navigation)

**Success**: Dashboard loads with business name visible

---

## Part 2: Verify Dashboard Metrics

Navigate to the **Dashboard** page and verify the following metric cards:

### Key Metrics to Check

| Metric                     | Expected Value | How to Verify                              |
| -------------------------- | -------------- | ------------------------------------------ |
| **Active Customers**       | 15             | Users with last visit ≤ 14 days ago        |
| **Inactive Customers**     | 5              | Users with last visit > 60 days ago        |
| **New Customers**          | 5              | Joined within last 30 days                 |
| **Total Points Issued**    | 775            | Sum of all points earned                   |
| **Total Rewards Redeemed** | 0              | None have been redeemed in demo (optional) |
| **Total Visits**           | 95             | Count of all purchase records              |

**Success**: All metric cards display expected values with Spanish labels

**Common Failure**:

- Metrics are off by a few points → verify seed migration completed
- Numbers show 0 → verify customer data exists in `customers` and `visits` tables
- Metrics won't load → check Supabase connection

---

## Part 3: Verify Inactive Customers Detection

### Check Inactive Customers Section on Dashboard

1. Look for the **"Clientes Inactivos" (Inactive Customers)** section
2. You should see **5 customers** listed:
   - Catalina Mendoza Rojas — 75 days inactive
   - Ángel Castillo Serrano — 90 days inactive
   - Valeria Santos López — 120 days inactive
   - Andrés Navarro Gómez — 85 days inactive
   - Lucía Fernández Jiménez — 95 days inactive

### Verify Inactivity Calculation

- **Threshold**: 60+ days since last visit
- **Days Inactive**: Last visit date compared to March 12, 2026
- **Display Format**: "X días inactivo" (e.g., "75 días inactivo")

**Success**: All 5 inactive customers appear with correct days

**Common Failure**:

- Fewer than 5 shown → check `last_visit_at` timestamps in seed
- Days count is wrong → check date calculation (should be relative to March 12, 2026)
- Section doesn't appear → verify customers exist and have `last_visit_at` > 60 days old

---

## Part 4: Verify Rewards System

### Check Active Reward Rules

Navigate to the **Rewards** page (`/dashboard/rewards`).

Expected active rewards:

| Rule                      | Points Required | Description                                |
| ------------------------- | --------------- | ------------------------------------------ |
| **Pastry Reward**         | 50 pts          | Redeemable for one pastry item             |
| **Coffee & Pastry Combo** | 150 pts         | Large coffee with seasonal pastry          |
| **Premium Gift Card**     | 300 pts         | $50 USD gift card                          |
| **VIP Experience**        | 500 pts         | ⚠️ **INACTIVE** — Not visible to customers |

**Success**: First 3 rules visible and active, VIP Experience hidden

---

## Part 5: Find Sample Customers to Test Points

### Search for High-Points Customers

Use the **Customer Search** feature (if available on dashboard or via POS). Test with these customers:

#### Tier 1: Close to Major Reward (150-299 pts)

- **María García López** (280 pts) — Close to 300pt reward
- **Juan Rodríguez Martínez** (185 pts) — At 150pt threshold (combo eligible)
- **Carmen Hernández Pérez** (225 pts)

#### Tier 2: Reward Eligible (≥300 pts)

- **Roberto Flores Sánchez** (310 pts) — **Already eligible for $50 Gift Card (300pt)**
- **Ricardo Solis Barrera** (32 pts) — New customer, testing low points

#### Tier 3: Inactive but Has Points

- **Catalina Mendoza Rojas** (45 pts, 75 days inactive) — Reactivation campaign candidate
- **Ángel Castillo Serrano** (62 pts, 90 days inactive)

**Success**: Each customer search returns correct points balance

---

## Part 6: Register a Purchase in POS (Caja)

### Overview

The POS (Point of Sale) module allows cashiers to register purchases and automatically calculate loyalty points.

### Step-by-Step Purchase Registration

1. **Navigate to Caja**
   - Go to `/dashboard/caja` (Cashier)
   - You should see "Registrar Compra" (Register Purchase) section

2. **Search for a Customer**
   - Use the customer search field
   - Search by **name** or **phone number**
   - Example: Search for "María García" or "+5255987654321"

3. **Select Customer**
   - Click on the customer from search results
   - Confirm customer name and _current_ points appear

4. **Enter Purchase Amount**
   - Example: $8.50 for pastries and coffee
   - Amount field should accept decimal values

5. **Submit Purchase**
   - Click "Registrar" or similar submit button
   - You should see a **success message** with points earned

### Expected Behavior After Purchase

**Before Purchase:**

- Roberto Flores: 310 points (eligible for 300pt reward)

**After $10 Purchase:**

- Points Earned: 10 (using floor calculation: `floor(10.0) = 10`)
- Roberto's New Balance: 320 points
- Message: "Roberto Flores ahora tiene 320 puntos. ¡Puede canjear la recompensa de Tarjeta de Regalo Premium ($300 pts)!"

### Points Calculation Rule

```
Points Earned = floor(purchase_amount)
$10.50 → 10 points
$6.75 → 6 points
$0.99 → 0 points (edge case)
```

**Success**: Purchase registered, points updated, confirmation message shown

---

## Part 7: Verify Points and Cashback Updates

### Check Customer Points After Purchase

1. **Return to Rewards Page** or **Customer View**
2. **Verify Points Updated**
   - Select the customer you just purchased for
   - Points should reflect the new balance

3. **Verify Reward Eligibility**
   - If customer now has ≥50 points: eligible for "Pastry Reward"
   - If customer now has ≥150 points: eligible for "Coffee & Pastry Combo"
   - If customer now has ≥300 points: eligible for "Premium Gift Card"

### Test Multiple Tiers

| Scenario            | Customer          | Starting Points | Purchase | Expected Total | Reward Eligible      |
| ------------------- | ----------------- | --------------- | -------- | -------------- | -------------------- |
| Unlock first reward | Alejandra Morales | 165 pts         | +20      | 185 pts        | ✅ 150pt combo (NEW) |
| Hit exact threshold | Any               | 140 pts         | +10      | 150 pts        | ✅ Exactly 150pt     |
| Multi-tier jump     | Ricardo Solis     | 32 pts          | +120     | 152 pts        | ✅ 150pt combo (NEW) |

**Success**: Points update instantly and reward eligibility recalculates

**Common Failure**:

- Points don't update → check if `source` field is recorded as `in_store`
- Reward eligibility doesn't change → verify reward rules have `is_active = true`
- Customer appears in wrong tier → verify points calculation (floor function)

---

## Part 8: Verify Recent Activity (Visits)

### Check Dashboard Recent Activity

1. Go back to **Dashboard** page
2. Look for **"Actividad Reciente" (Recent Activity)** section
3. Verify your recent purchase appears with:
   - Customer name
   - Amount purchased
   - Points earned
   - Timestamp (should be today or "hoy")

**Success**: Latest visit appears in activity feed

---

## Part 9: Test Reactivation Campaign

### Campaign Setup (Already Seeded)

**Campaign**: "Welcome Back Spring"

- **Type**: Reactivation
- **Target**: Inactive 60+ days
- **Status**: Draft
- **Candidates**: 5 inactive customers

### Manual Verification

1. Navigate to **Campaigns** page (`/dashboard/campaigns`)
2. Click on **"Welcome Back Spring"** campaign
3. Verify:
   - Status shows as "Draft"
   - **5 Campaign Targets** listed (the 5 inactive customers):
     - Catalina Mendoza Rojas
     - Ángel Castillo Serrano
     - Valeria Santos López
     - Andrés Navarro Gómez
     - Lucía Fernández Jiménez

4. Verify each target has:
   - Customer name
   - Days inactive count
   - Delivery status: "Simulated" (demo flag)

**Success**: Campaign lists all 5 inactive customers with correct inactivity counts

---

## Part 10: Complete Validation Checklist

Print or check off each item:

### ✅ Business Setup

- [ ] Demo business "Café & Pastelería Delicia" appears
- [ ] Business is accessible from dashboard

### ✅ Dashboard Metrics

- [ ] Active Customers: 15
- [ ] Inactive Customers: 5
- [ ] New Customers: 5
- [ ] Total Visits: 95
- [ ] Total Points: 775

### ✅ Inactive Customer Detection

- [ ] 5 inactive customers listed (60+ days)
- [ ] Days inactivity calculated correctly
- [ ] Appears on dashboard and campaigns

### ✅ Rewards System

- [ ] 3 active reward rules visible
- [ ] VIP Experience (500pt) is INACTIVE (hidden)
- [ ] Point thresholds: 50, 150, 300 pts

### ✅ Customer Search & POS

- [ ] Can search customers by name
- [ ] Can search customers by phone
- [ ] Can register purchases
- [ ] Points calculated correctly (floor function)

### ✅ Points & Eligibility

- [ ] Purchase adds points to balance
- [ ] Reward eligibility updates instantly
- [ ] High-points customers show eligible rewards

### ✅ Recent Activity

- [ ] New purchases appear in activity feed
- [ ] Timestamps display correctly
- [ ] Points earned shows in activity

### ✅ Campaign Module

- [ ] "Welcome Back Spring" campaign visible
- [ ] 5 inactive customers listed as targets
- [ ] Campaign status shows "Draft"

---

## Success Criteria

### Full Validation Success ✅

All of the following conditions are met:

1. **Data Integrity**: 20 customers, 95 visits, 775 total points
2. **Segmentation**: 15 active, 5 inactive, 5 new identified correctly
3. **Rewards**: 3 active rules + 1 inactive rule as expected
4. **POS Flow**: Can register purchase → points update → eligibility recalculates
5. **Dashboard**: Metrics, inactive list, and recent activity all display
6. **Campaign**: Reactivation targets correct inactive customers

---

## Common Failure Cases & Troubleshooting

### ❌ Metrics Show 0 or Wrong Numbers

**Cause**: Seed migration incomplete or failed

**Fix**:

1. Check Supabase dashboard → verify tables exist:
   - `customers`
   - `visits`
   - `reward_rules`
   - `campaigns`
   - `campaign_deliveries`

2. Check seed logs for errors
3. Re-run seed migration:
   ```bash
   npm run db:seed
   ```

### ❌ Customers Not Showing in Search

**Cause**: Customer records exist but search isn't querying correctly

**Fix**:

1. Verify `business_id` matches current business in auth
2. Check that customer records have `name` and `phone` fields populated
3. Verify search query limits results properly

### ❌ Points Don't Update After Purchase

**Cause**: Visit record not saved or points calculation failed

**Fix**:

1. Verify amount is valid decimal (e.g., 8.50, not "8,50")
2. Check database for new visit record (should appear in `visits` table)
3. Verify `transactions` source flag is set to `in_store`
4. Check customer `last_visit_at` is updated to today

### ❌ Inactive Customers List Empty or Wrong Count

**Cause**: Last visit dates not calculated correctly

**Fix**:

1. Verify `last_visit_at` values in customers are 60+ days old
2. Check that inactivity threshold is 60 days
3. Today's date should be March 12, 2026 (reference date)
4. Recalculate: March 12 - 75 days = December 27, 2025 (Catalina should show 75 days)

### ❌ Reward Rules Not Appearing

**Cause**: Rules not marked as active or not associated with business

**Fix**:

1. Check `is_active` field in `reward_rules` table
2. Verify `business_id` matches current business
3. Rules must have `is_active = true` (first 3) or `false` (VIP)

### ❌ Campaign Targets Missing

**Cause**: Campaign deliveries not created or linked incorrectly

**Fix**:

1. Verify `campaign_deliveries` table has records
2. Check `customer_id` in deliveries matches inactive customers
3. Verify delivery status is "simulated"

### ❌ Recent Activity Blank or Wrong Timestamps

**Cause**: Visits not being fetched or date formatting issue

**Fix**:

1. Check that `source` field on visits is populated (`in_store`, `manual`, `qr`, etc.)
2. Verify `created_at` timestamps are recent (within last few days if testing today)
3. Check locale setting for date format (should be `es-MX` for Spanish dates)

---

## Quick Reference: Key Test Data

### Frequent Customers (Test Rewards)

```
1. María García López       280 pts  | Last visit: 1 day ago
2. Juan Rodríguez Martínez  185 pts  | Last visit: 2 days ago
3. Carmen Hernández Pérez   225 pts  | Last visit: 3 days ago
4. Roberto Flores Sánchez   310 pts  | Last visit: TODAY ✨ ELIGIBLE FOR 300PT REWARD
5. Alejandra Morales Cruz   165 pts  | Last visit: 4 days ago
```

### Inactive Customers (Test Reactivation)

```
1. Catalina Mendoza Rojas         45 pts  | Inactive: 75 days
2. Ángel Castillo Serrano         62 pts  | Inactive: 90 days
3. Valeria Santos López           34 pts  | Inactive: 120 days
4. Andrés Navarro Gómez           51 pts  | Inactive: 85 days
5. Lucía Fernández Jiménez        29 pts  | Inactive: 95 days
```

### Reward Tiers

```
50 pts  → Pastry Reward (active)
150 pts → Coffee & Pastry Combo (active)
300 pts → Premium Gift Card (active)
500 pts → VIP Experience (INACTIVE — don't expect to see)
```

---

## Next Steps After Validation

Once all checks pass:

1. ✅ Demo is ready for **product demos** with clients/stakeholders
2. ✅ Demo data is ready for **QA testing** of loyalty features
3. ✅ Dashboard metrics can be used as **baseline for testing**
4. ✅ Sample customers can be used for **feature demos** (search, rewards, POS)

---

## Questions or Issues?

- Check `/lib/BAKERY_DEMO_README.md` for data structure details
- Review `/lib/bakery-demo.ts` for exact data values
- Check test files in `/tests/*` for validation patterns
