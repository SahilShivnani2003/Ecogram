export interface Referral {
  _id?: string;
  referrer: string;
  referred: string;
  referralCode: string;
  status: 'pending' | 'active' | 'inactive';
  monthlyIncomeRate: number;
  totalEarned: number;
  lastPaidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}