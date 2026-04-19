export interface LuxuryStayEntitlement {
  _id?: string;
  user: string;
  financialYear: string;
  totalEntitled: number;
  used: number;
  bookings: string[];
  expiresAt: Date;
  status: 'active' | 'expired';
  createdAt?: Date;
  updatedAt?: Date;
}