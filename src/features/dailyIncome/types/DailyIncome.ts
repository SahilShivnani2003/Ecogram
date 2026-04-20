export interface DailyIncome {
  _id?: string;
  user: string;
  investment: string;
  date: Date;
  incomeType: 'cow' | 'land' | 'referral' | 'reward' | 'cashback';
  amount: number;
  description?: string;
  milkLitres?: number;
  ratePerLitre?: number;
  productionValue?: number;
  cowId?: string;
  plotId?: string;
  status: 'pending' | 'credited';
  createdAt?: Date;
  updatedAt?: Date;
}