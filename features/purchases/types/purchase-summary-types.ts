export type PurchaseSummaryVisitSource = "manual" | "in_store" | "qr";

export interface PurchaseSummaryVisit {
  id: string;
  businessId: string;
  customerId: string;
  amount: number;
  source: PurchaseSummaryVisitSource;
  createdAt: string;
}

export interface PurchaseSummaryRewardRule {
  id: string;
  businessId: string;
  name: string;
  pointsRequired: number;
  rewardDescription: string;
}

export interface PurchaseSummaryData {
  visit: PurchaseSummaryVisit;
  customerName: string;
  pointsEarned: number;
  totalAccumulatedPoints: number;
  activeRewardRule: PurchaseSummaryRewardRule | null;
  pointsToNextReward: number | null;
}

export interface GetPurchaseSummaryDataInput {
  visitId: string;
  businessId?: string;
}
