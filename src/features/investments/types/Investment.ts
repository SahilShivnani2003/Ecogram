export interface LandDetails {
  sqft?: number;
  pricePerSqft?: number;
  totalValue?: number;
  plotId?: string;
  guaranteedDailyIncome?: number;
}

export interface CowDetails {
  cowCount?: number;
  cowPrice?: number;
  investorPercentage?: number;
  companyPercentage?: number;
  investorContribution?: number;
  companyContribution?: number;
  leasingAgreementUrl?: string;
  purchaseBillUrl?: string;
  cowId?: string;
  lactationStartDate?: Date;
  lactationEndDate?: Date;
  lactationMonthsRemaining?: number;
  milkCapacityMin?: number;
  milkCapacityMax?: number;
  ratePerLitre?: number;
  renewalEligible?: boolean;
  renewalRequested?: boolean;
  renewalDate?: Date;
}

export interface Investment {
  _id?: string;
  user: string;
  plan: string;
  planName: string;
  planType: 'land' | 'cow';
  investedAmount: number;
  returnRate: number;
  durationMonths: number;
  returnAmount: number;
  profitAmount: number;
  startDate?: Date;
  maturityDate: Date;
  status: 'pending' | 'active' | 'matured' | 'withdrawn' | 'cancelled' | 'rejected';
  paymentId?: string;
  paymentMode: 'cash' | 'wallet';

  topUpNumber: number;
  financialYear: string;

  cashbackReceived: boolean;
  cashbackAmount: number;
  rewardPointsEarned: number;

  landDetails?: LandDetails;
  cowDetails?: CowDetails;

  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}