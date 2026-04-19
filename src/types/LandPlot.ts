export interface LandPlot {
  _id?: string;
  plotId: string;
  sizeInSqFt: number;
  pricePerSqFt: number;
  totalPrice?: number;
  location?: string;
  yieldPercent: number;
  products: string[];
  assignedTo?: string | null;
  investmentId?: string | null;
  status: 'available' | 'leased' | 'maintenance';
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}