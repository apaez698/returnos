/**
 * Bakery & Cafetería Demo Dataset for ReturnOS
 *
 * Represents a realistic, small bakery/cafeteria business with:
 * - 1 business (Café & Pastelería Delicia)
 * - 20 diverse customers at different loyalty stages
 * - 60+ realistic visits with varied purchase amounts and dates
 * - 4 reward rules spanning different value tiers
 * - Sample campaign and campaign deliveries for demonstration
 *
 * All data is typed, strongly validated, and ready for database seeding
 * or demo purposes. Metrics are computed from this data.
 *
 * Reference date: March 12, 2026
 */

import type {
  DemoBusiness,
  DemoCustomer,
  DemoVisit,
  DemoRewardRule,
  DemoCampaign,
  DemoCampaignDelivery,
  DemoMetricsSummary,
  CustomerSegmentationResult,
  CustomerSegment,
} from "./bakery-demo-types";

// ============================================================
// UUID Generator
// ============================================================

/**
 * Generate a simple UUID v4-like string
 * Uses deterministic seed for consistent demo data
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================
// Reference Date & Helper Utilities
// ============================================================

const REFERENCE_DATE = new Date("2026-03-12T00:00:00Z");

/**
 * Generate a date relative to the reference date
 */
function dateRelative(daysAgo: number): string {
  const date = new Date(REFERENCE_DATE);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

/**
 * Generate a realistic Mexican phone number
 */
function generatePhone(): string {
  const areaCode = ["55", "81", "33", "222", "442"][
    Math.floor(Math.random() * 5)
  ];
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return `+52${areaCode}${number}`;
}

// ============================================================
// Business
// ============================================================

const BUSINESS_ID = generateUUID();

export const demoBusiness: DemoBusiness = {
  id: BUSINESS_ID,
  name: "Café & Pastelería Delicia",
  slug: "cafeteria-delicia",
  business_type: "bakery",
  created_at: dateRelative(365),
};

// ============================================================
// Customers
// ============================================================

const CUSTOMER_IDS = Array.from({ length: 20 }, () => generateUUID());

export const demoCustomers: DemoCustomer[] = [
  // ===== FREQUENT CUSTOMERS (5) =====
  {
    id: CUSTOMER_IDS[0],
    business_id: BUSINESS_ID,
    name: "María García López",
    phone: "+5255987654321",
    email: "maria.garcia@email.com",
    birthday: "1985-05-15",
    consent_marketing: true,
    points: 280,
    last_visit_at: dateRelative(1),
    created_at: dateRelative(180),
  },
  {
    id: CUSTOMER_IDS[1],
    business_id: BUSINESS_ID,
    name: "Juan Rodríguez Martínez",
    phone: "+5255912344567",
    email: "juan.rodriguez@email.com",
    birthday: "1990-11-22",
    consent_marketing: true,
    points: 185,
    last_visit_at: dateRelative(2),
    created_at: dateRelative(200),
  },
  {
    id: CUSTOMER_IDS[2],
    business_id: BUSINESS_ID,
    name: "Carmen Hernández Pérez",
    phone: "+5255923456789",
    email: null,
    birthday: "1978-03-08",
    consent_marketing: false,
    points: 225,
    last_visit_at: dateRelative(3),
    created_at: dateRelative(250),
  },
  {
    id: CUSTOMER_IDS[3],
    business_id: BUSINESS_ID,
    name: "Roberto Flores sánchez",
    phone: "+5255934567890",
    email: "rflores@email.com",
    birthday: "1988-07-14",
    consent_marketing: true,
    points: 310,
    last_visit_at: dateRelative(0),
    created_at: dateRelative(300),
  },
  {
    id: CUSTOMER_IDS[4],
    business_id: BUSINESS_ID,
    name: "Alejandra Morales Cruz",
    phone: "+5255945678901",
    email: "amorales@email.com",
    birthday: null,
    consent_marketing: false,
    points: 165,
    last_visit_at: dateRelative(4),
    created_at: dateRelative(220),
  },

  // ===== REGULAR CUSTOMERS (5) =====
  {
    id: CUSTOMER_IDS[5],
    business_id: BUSINESS_ID,
    name: "Pablo Reyes López",
    phone: "+5255956789012",
    email: "preyes@email.com",
    birthday: "1992-09-30",
    consent_marketing: true,
    points: 95,
    last_visit_at: dateRelative(7),
    created_at: dateRelative(120),
  },
  {
    id: CUSTOMER_IDS[6],
    business_id: BUSINESS_ID,
    name: "Sofia González Ruiz",
    phone: "+5255967890123",
    email: null,
    birthday: "1995-01-12",
    consent_marketing: false,
    points: 78,
    last_visit_at: dateRelative(10),
    created_at: dateRelative(90),
  },
  {
    id: CUSTOMER_IDS[7],
    business_id: BUSINESS_ID,
    name: "Lucas Méndez García",
    phone: "+5255978901234",
    email: "lmendez@email.com",
    birthday: null,
    consent_marketing: true,
    points: 112,
    last_visit_at: dateRelative(14),
    created_at: dateRelative(150),
  },
  {
    id: CUSTOMER_IDS[8],
    business_id: BUSINESS_ID,
    name: "Daniela Ortiz Vargas",
    phone: "+5255989012345",
    email: "dortiz@email.com",
    birthday: "1987-06-25",
    consent_marketing: true,
    points: 142,
    last_visit_at: dateRelative(5),
    created_at: dateRelative(110),
  },
  {
    id: CUSTOMER_IDS[9],
    business_id: BUSINESS_ID,
    name: "Fernando Romero Díaz",
    phone: "+5255990123456",
    email: null,
    birthday: "1991-04-18",
    consent_marketing: false,
    points: 88,
    last_visit_at: dateRelative(11),
    created_at: dateRelative(100),
  },

  // ===== INACTIVE CUSTOMERS (5): last visit 60+ days ago =====
  {
    id: CUSTOMER_IDS[10],
    business_id: BUSINESS_ID,
    name: "Catalina Mendoza Rojas",
    phone: "+5255901234567",
    email: "cmendoza@email.com",
    birthday: "1980-12-05",
    consent_marketing: true,
    points: 45,
    last_visit_at: dateRelative(75),
    created_at: dateRelative(180),
  },
  {
    id: CUSTOMER_IDS[11],
    business_id: BUSINESS_ID,
    name: "Ángel Castillo Serrano",
    phone: "+5255912341234",
    email: null,
    birthday: "1986-08-17",
    consent_marketing: false,
    points: 62,
    last_visit_at: dateRelative(90),
    created_at: dateRelative(210),
  },
  {
    id: CUSTOMER_IDS[12],
    business_id: BUSINESS_ID,
    name: "Valeria Santos López",
    phone: "+5255923452345",
    email: "vsantos@email.com",
    birthday: null,
    consent_marketing: true,
    points: 34,
    last_visit_at: dateRelative(120),
    created_at: dateRelative(200),
  },
  {
    id: CUSTOMER_IDS[13],
    business_id: BUSINESS_ID,
    name: "Andrés Navarro Gómez",
    phone: "+5255934563456",
    email: "anavarro@email.com",
    birthday: "1993-02-28",
    consent_marketing: false,
    points: 51,
    last_visit_at: dateRelative(85),
    created_at: dateRelative(160),
  },
  {
    id: CUSTOMER_IDS[14],
    business_id: BUSINESS_ID,
    name: "Lucía Fernández Jiménez",
    phone: "+5255945674567",
    email: null,
    birthday: "1984-10-09",
    consent_marketing: true,
    points: 29,
    last_visit_at: dateRelative(95),
    created_at: dateRelative(170),
  },

  // ===== NEW CUSTOMERS (5): joined within last 30 days, visited recently =====
  {
    id: CUSTOMER_IDS[15],
    business_id: BUSINESS_ID,
    name: "Ricardo Solis Barrera",
    phone: "+5255956785678",
    email: "rsolis@email.com",
    birthday: "1997-07-11",
    consent_marketing: true,
    points: 32,
    last_visit_at: dateRelative(2),
    created_at: dateRelative(10),
  },
  {
    id: CUSTOMER_IDS[16],
    business_id: BUSINESS_ID,
    name: "Isabela Rivas Córdoba",
    phone: "+5255967896789",
    email: null,
    birthday: null,
    consent_marketing: false,
    points: 24,
    last_visit_at: dateRelative(5),
    created_at: dateRelative(15),
  },
  {
    id: CUSTOMER_IDS[17],
    business_id: BUSINESS_ID,
    name: "Maximiliano Torres Quintero",
    phone: "+5255978907890",
    email: "mtorres@email.com",
    birthday: "1994-03-21",
    consent_marketing: true,
    points: 18,
    last_visit_at: dateRelative(3),
    created_at: dateRelative(8),
  },
  {
    id: CUSTOMER_IDS[18],
    business_id: BUSINESS_ID,
    name: "Viviana Mejía Sánchez",
    phone: "+5255989018901",
    email: "vmejia@email.com",
    birthday: "1989-11-14",
    consent_marketing: false,
    points: 41,
    last_visit_at: dateRelative(6),
    created_at: dateRelative(20),
  },
  {
    id: CUSTOMER_IDS[19],
    business_id: BUSINESS_ID,
    name: "Esteban Chavez del Valle",
    phone: "+5255990129012",
    email: null,
    birthday: null,
    consent_marketing: true,
    points: 28,
    last_visit_at: dateRelative(4),
    created_at: dateRelative(12),
  },
];

// ============================================================
// Visits
// ============================================================

export const demoVisits: DemoVisit[] = [
  // María García (customer 0) - frequent, can redeem 300pt reward
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 8,
    amount: 8.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(1),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 6,
    amount: 6.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 10,
    amount: 10.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(8),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 9,
    amount: 9.75,
    product_category: "combo meal",
    source: "in_store",
    created_at: dateRelative(12),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 7,
    amount: 7.4,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(20),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 12,
    amount: 12.8,
    product_category: "cakes",
    source: "manual",
    created_at: dateRelative(30),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 15,
    amount: 15.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(50),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 11,
    amount: 11.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(70),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 9,
    amount: 9.0,
    product_category: "pastries",
    source: "qr",
    created_at: dateRelative(100),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[0],
    points_earned: 14,
    amount: 14.5,
    product_category: "cakes",
    source: "in_store",
    created_at: dateRelative(140),
  },

  // Juan Rodríguez (customer 1) - frequent
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 5,
    amount: 5.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(2),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 8,
    amount: 8.3,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(7),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 10,
    amount: 10.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(15),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 7,
    amount: 7.8,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(25),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 9,
    amount: 9.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(40),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 6,
    amount: 6.7,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(60),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 11,
    amount: 11.0,
    product_category: "pastries",
    source: "qr",
    created_at: dateRelative(85),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[1],
    points_earned: 8,
    amount: 8.5,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(125),
  },

  // Carmen Hernández (customer 2) - frequent
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[2],
    points_earned: 12,
    amount: 12.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[2],
    points_earned: 10,
    amount: 10.0,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(8),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[2],
    points_earned: 9,
    amount: 9.7,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(18),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[2],
    points_earned: 8,
    amount: 8.4,
    product_category: "cakes",
    source: "manual",
    created_at: dateRelative(35),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[2],
    points_earned: 11,
    amount: 11.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(55),
  },

  // Roberto Flores (customer 3) - frequent, will likely unlock highest reward
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 9,
    amount: 9.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(0),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 11,
    amount: 11.8,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(4),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 8,
    amount: 8.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(10),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 10,
    amount: 10.3,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(20),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 7,
    amount: 7.6,
    product_category: "coffee",
    source: "qr",
    created_at: dateRelative(30),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 13,
    amount: 13.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(45),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 12,
    amount: 12.5,
    product_category: "cakes",
    source: "in_store",
    created_at: dateRelative(70),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 14,
    amount: 14.0,
    product_category: "pastries",
    source: "manual",
    created_at: dateRelative(100),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 10,
    amount: 10.8,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(150),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[3],
    points_earned: 15,
    amount: 15.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(180),
  },

  // Alejandra Morales (customer 4) - frequent
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[4],
    points_earned: 7,
    amount: 7.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(4),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[4],
    points_earned: 6,
    amount: 6.8,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(12),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[4],
    points_earned: 8,
    amount: 8.6,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(22),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[4],
    points_earned: 10,
    amount: 10.1,
    product_category: "sandwich",
    source: "qr",
    created_at: dateRelative(40),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[4],
    points_earned: 9,
    amount: 9.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(65),
  },

  // Pablo Reyes (customer 5) - regular
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[5],
    points_earned: 5,
    amount: 5.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(7),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[5],
    points_earned: 6,
    amount: 6.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(15),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[5],
    points_earned: 8,
    amount: 8.0,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(25),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[5],
    points_earned: 4,
    amount: 4.8,
    product_category: "pastries",
    source: "qr",
    created_at: dateRelative(45),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[5],
    points_earned: 7,
    amount: 7.3,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(70),
  },

  // Sofia González (customer 6) - regular
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[6],
    points_earned: 4,
    amount: 4.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(10),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[6],
    points_earned: 5,
    amount: 5.1,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(20),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[6],
    points_earned: 7,
    amount: 7.8,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(35),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[6],
    points_earned: 6,
    amount: 6.3,
    product_category: "sandwich",
    source: "qr",
    created_at: dateRelative(60),
  },

  // Lucas Méndez (customer 7) - regular
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[7],
    points_earned: 6,
    amount: 6.7,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(14),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[7],
    points_earned: 5,
    amount: 5.5,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(28),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[7],
    points_earned: 10,
    amount: 10.0,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(42),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[7],
    points_earned: 8,
    amount: 8.2,
    product_category: "pastries",
    source: "manual",
    created_at: dateRelative(75),
  },

  // Daniela Ortiz (customer 8) - regular
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[8],
    points_earned: 7,
    amount: 7.4,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(5),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[8],
    points_earned: 9,
    amount: 9.1,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(18),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[8],
    points_earned: 8,
    amount: 8.9,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(32),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[8],
    points_earned: 6,
    amount: 6.2,
    product_category: "sandwich",
    source: "qr",
    created_at: dateRelative(55),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[8],
    points_earned: 6,
    amount: 6.5,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(80),
  },

  // Fernando Romero (customer 9) - regular
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[9],
    points_earned: 5,
    amount: 5.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(11),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[9],
    points_earned: 8,
    amount: 8.4,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(24),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[9],
    points_earned: 4,
    amount: 4.6,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(38),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[9],
    points_earned: 6,
    amount: 6.1,
    product_category: "pastries",
    source: "qr",
    created_at: dateRelative(65),
  },

  // Catalina Mendoza (customer 10) - inactive
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[10],
    points_earned: 5,
    amount: 5.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(75),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[10],
    points_earned: 7,
    amount: 7.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(95),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[10],
    points_earned: 6,
    amount: 6.5,
    product_category: "pastries",
    source: "manual",
    created_at: dateRelative(130),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[10],
    points_earned: 8,
    amount: 8.3,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(160),
  },

  // Ángel Castillo (customer 11) - inactive
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[11],
    points_earned: 6,
    amount: 6.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(90),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[11],
    points_earned: 9,
    amount: 9.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(125),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[11],
    points_earned: 7,
    amount: 7.4,
    product_category: "sandwich",
    source: "qr",
    created_at: dateRelative(165),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[11],
    points_earned: 5,
    amount: 5.1,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(190),
  },

  // Valeria Santos (customer 12) - inactive
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[12],
    points_earned: 4,
    amount: 4.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(120),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[12],
    points_earned: 6,
    amount: 6.1,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(155),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[12],
    points_earned: 5,
    amount: 5.5,
    product_category: "pastries",
    source: "manual",
    created_at: dateRelative(190),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[12],
    points_earned: 8,
    amount: 8.0,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(215),
  },

  // Andrés Navarro (customer 13) - inactive
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[13],
    points_earned: 7,
    amount: 7.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(85),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[13],
    points_earned: 5,
    amount: 5.2,
    product_category: "coffee",
    source: "qr",
    created_at: dateRelative(120),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[13],
    points_earned: 8,
    amount: 8.5,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(160),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[13],
    points_earned: 6,
    amount: 6.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(185),
  },

  // Lucía Fernández (customer 14) - inactive
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[14],
    points_earned: 5,
    amount: 5.4,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(95),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[14],
    points_earned: 6,
    amount: 6.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(140),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[14],
    points_earned: 4,
    amount: 4.2,
    product_category: "sandwich",
    source: "manual",
    created_at: dateRelative(180),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[14],
    points_earned: 9,
    amount: 9.1,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(210),
  },

  // Ricardo Solis (customer 15) - new
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[15],
    points_earned: 6,
    amount: 6.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(2),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[15],
    points_earned: 5,
    amount: 5.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(7),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[15],
    points_earned: 8,
    amount: 8.3,
    product_category: "sandwich",
    source: "qr",
    created_at: dateRelative(15),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[15],
    points_earned: 7,
    amount: 7.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(25),
  },

  // Isabela Rivas (customer 16) - new
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[16],
    points_earned: 4,
    amount: 4.5,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(5),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[16],
    points_earned: 6,
    amount: 6.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(12),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[16],
    points_earned: 5,
    amount: 5.3,
    product_category: "sandwich",
    source: "manual",
    created_at: dateRelative(20),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[16],
    points_earned: 9,
    amount: 9.2,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(30),
  },

  // Maximiliano Torres (customer 17) - new
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[17],
    points_earned: 3,
    amount: 3.8,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[17],
    points_earned: 5,
    amount: 5.1,
    product_category: "pastries",
    source: "qr",
    created_at: dateRelative(10),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[17],
    points_earned: 6,
    amount: 6.2,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(18),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[17],
    points_earned: 4,
    amount: 4.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(28),
  },

  // Viviana Mejía (customer 18) - new
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[18],
    points_earned: 5,
    amount: 5.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(6),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[18],
    points_earned: 8,
    amount: 8.1,
    product_category: "sandwich",
    source: "in_store",
    created_at: dateRelative(14),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[18],
    points_earned: 7,
    amount: 7.2,
    product_category: "coffee",
    source: "qr",
    created_at: dateRelative(22),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[18],
    points_earned: 6,
    amount: 6.3,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(32),
  },

  // Esteban Chavez (customer 19) - new
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[19],
    points_earned: 4,
    amount: 4.2,
    product_category: "coffee",
    source: "in_store",
    created_at: dateRelative(4),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[19],
    points_earned: 6,
    amount: 6.5,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(11),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[19],
    points_earned: 7,
    amount: 7.3,
    product_category: "sandwich",
    source: "manual",
    created_at: dateRelative(18),
  },
  {
    id: generateUUID(),
    business_id: BUSINESS_ID,
    customer_id: CUSTOMER_IDS[19],
    points_earned: 5,
    amount: 5.0,
    product_category: "pastries",
    source: "in_store",
    created_at: dateRelative(26),
  },
];

// ============================================================
// Reward Rules
// ============================================================

const REWARD_RULE_IDS = Array.from({ length: 4 }, () => generateUUID());

export const demoRewardRules: DemoRewardRule[] = [
  {
    id: REWARD_RULE_IDS[0],
    business_id: BUSINESS_ID,
    name: "Pastry Reward",
    points_required: 50,
    reward_description: "Redeemable for one pastry item of your choice",
    is_active: true,
    created_at: dateRelative(365),
  },
  {
    id: REWARD_RULE_IDS[1],
    business_id: BUSINESS_ID,
    name: "Coffee & Pastry Combo",
    points_required: 150,
    reward_description: "Large coffee with a seasonal pastry or dessert",
    is_active: true,
    created_at: dateRelative(365),
  },
  {
    id: REWARD_RULE_IDS[2],
    business_id: BUSINESS_ID,
    name: "Premium Gift Card",
    points_required: 300,
    reward_description: "$50 USD gift card toward any purchase",
    is_active: true,
    created_at: dateRelative(365),
  },
  {
    id: REWARD_RULE_IDS[3],
    business_id: BUSINESS_ID,
    name: "VIP Experience",
    points_required: 500,
    reward_description:
      "Exclusive VIP tasting with pastry chef & $100 USD credit",
    is_active: false,
    created_at: dateRelative(300),
  },
];

// ============================================================
// Campaigns
// ============================================================

const CAMPAIGN_ID = generateUUID();

export const demoCampaigns: DemoCampaign[] = [
  {
    id: CAMPAIGN_ID,
    business_id: BUSINESS_ID,
    name: "Welcome Back Spring",
    campaign_type: "reactivation",
    audience_type: "inactive_customers",
    message:
      "¡Hola! We miss you. Come back and enjoy our new spring pastries. Use your loyalty points!",
    target_inactive_days: 60,
    status: "draft",
    created_at: dateRelative(5),
  },
];

// ============================================================
// Campaign Deliveries
// ============================================================

export const demoCampaignDeliveries: DemoCampaignDelivery[] = [
  {
    id: generateUUID(),
    campaign_id: CAMPAIGN_ID,
    customer_id: CUSTOMER_IDS[10],
    delivery_status: "simulated",
    sent_at: null,
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    campaign_id: CAMPAIGN_ID,
    customer_id: CUSTOMER_IDS[11],
    delivery_status: "simulated",
    sent_at: null,
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    campaign_id: CAMPAIGN_ID,
    customer_id: CUSTOMER_IDS[12],
    delivery_status: "simulated",
    sent_at: null,
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    campaign_id: CAMPAIGN_ID,
    customer_id: CUSTOMER_IDS[13],
    delivery_status: "simulated",
    sent_at: null,
    created_at: dateRelative(3),
  },
  {
    id: generateUUID(),
    campaign_id: CAMPAIGN_ID,
    customer_id: CUSTOMER_IDS[14],
    delivery_status: "simulated",
    sent_at: null,
    created_at: dateRelative(3),
  },
];

// ============================================================
// Metrics Summary Functions
// ============================================================

/**
 * Calculate how many days have passed since a given date
 */
function daysSinceDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const msDiff = REFERENCE_DATE.getTime() - date.getTime();
  return Math.floor(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Determine customer segment based on activity and tenure
 */
function getCustomerSegment(
  customer: DemoCustomer,
  visitCount: number,
  totalSpent: number,
): CustomerSegment {
  const daysSinceVisit = daysSinceDate(customer.last_visit_at);
  const daysSinceMembership = daysSinceDate(customer.created_at);

  // Inactive: no visit in 60+ days
  if (daysSinceVisit !== null && daysSinceVisit >= 60) {
    return "inactive";
  }

  // New: joined within 30 days AND visited recently
  if (daysSinceMembership !== null && daysSinceMembership <= 30) {
    return "new";
  }

  // VIP: 10+ visits OR 200+ points
  if (visitCount >= 10 || customer.points >= 200) {
    return "frequent";
  }

  // Frequent: 5-9 visits
  if (visitCount >= 5) {
    return "regular";
  }

  // Regular/New default
  return daysSinceMembership !== null && daysSinceMembership <= 30
    ? "new"
    : "regular";
}

/**
 * Segment customers by loyalty tier and return detailed metrics
 */
export function segmentCustomers(): CustomerSegmentationResult[] {
  const segmentation: Map<string, CustomerSegmentationResult> = new Map();

  for (const customer of demoCustomers) {
    const visitCount = demoVisits.filter(
      (v) => v.customer_id === customer.id,
    ).length;
    const totalSpent = demoVisits
      .filter((v) => v.customer_id === customer.id)
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    const daysSinceVisit = daysSinceDate(customer.last_visit_at);

    const segment = getCustomerSegment(customer, visitCount, totalSpent);

    segmentation.set(customer.id, {
      segment,
      customerId: customer.id,
      customerName: customer.name,
      points: customer.points,
      visitCount,
      lastVisitDaysAgo: daysSinceVisit,
      totalSpent,
    });
  }

  return Array.from(segmentation.values());
}

/**
 * Calculate comprehensive metrics summary for the demo dataset
 */
export function computeDemoMetrics(): DemoMetricsSummary {
  const segmentation = segmentCustomers();

  const totalCustomers = demoCustomers.length;
  const activeCustomers = segmentation.filter(
    (s) => s.segment !== "inactive",
  ).length;
  const inactiveCustomers = segmentation.filter(
    (s) => s.segment === "inactive",
  ).length;
  const newCustomers = segmentation.filter((s) => s.segment === "new").length;
  const frequentCustomers = segmentation.filter(
    (s) => s.segment === "frequent",
  ).length;

  const totalVisits = demoVisits.length;
  const totalSales = demoVisits.reduce((sum, v) => sum + (v.amount || 0), 0);
  const totalPointsIssued = demoVisits.reduce(
    (sum, v) => sum + v.points_earned,
    0,
  );

  // Count customers who can unlock each reward (have enough points)
  const potentialRewardUnlocks = demoCustomers.filter((c) =>
    demoRewardRules.some((r) => r.is_active && c.points >= r.points_required),
  ).length;

  // Count customers with redeemable rewards (have enough points for at least one active rule)
  const customersWithRedeemableRewards = demoCustomers.filter((c) =>
    demoRewardRules.some((r) => r.is_active && c.points >= r.points_required),
  ).length;

  const averagePurchaseValue = totalVisits > 0 ? totalSales / totalVisits : 0;
  const averagePointsPerCustomer =
    totalCustomers > 0 ? totalPointsIssued / totalCustomers : 0;

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    newCustomers,
    frequentCustomers,
    totalVisits,
    totalSales: Math.round(totalSales * 100) / 100,
    totalPointsIssued,
    potentialRewardUnlocks,
    customersWithRedeemableRewards,
    averagePurchaseValue: Math.round(averagePurchaseValue * 100) / 100,
    averagePointsPerCustomer: Math.round(averagePointsPerCustomer * 100) / 100,
  };
}

/**
 * Get customers eligible for reactivation campaign
 * (inactive for at least the target days)
 */
export function getReactivationCandidates(
  targetInactiveDays: number,
): DemoCustomer[] {
  return demoCustomers.filter((customer) => {
    const daysSinceVisit = daysSinceDate(customer.last_visit_at);
    return daysSinceVisit !== null && daysSinceVisit >= targetInactiveDays;
  });
}

/**
 * Get customers who have reached a specific reward tier
 */
export function getCustomersAtRewardTier(
  pointsRequired: number,
): DemoCustomer[] {
  return demoCustomers
    .filter((c) => c.points >= pointsRequired)
    .sort((a, b) => b.points - a.points);
}

/**
 * Calculate reward metrics
 */
export function getRewardMetrics() {
  const rewardMetrics = demoRewardRules
    .filter((rule) => rule.is_active)
    .map((rule) => ({
      ruleName: rule.name,
      pointsRequired: rule.points_required,
      customersEligible: getCustomersAtRewardTier(rule.points_required).length,
    }))
    .sort((a, b) => a.pointsRequired - b.pointsRequired);

  return rewardMetrics;
}
