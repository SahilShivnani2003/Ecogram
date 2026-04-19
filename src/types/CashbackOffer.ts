export interface CashbackOffer {
  _id?: string;
  isActive: boolean;
  percentage: number;
  startDate?: Date;
  endDate?: Date;
  description: string;
  totalCashbackGiven: number;
  totalUsersReceived: number;
  createdAt?: Date;
  updatedAt?: Date;
}