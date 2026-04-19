export interface Cow {
  _id?: string;
  cowId: string;
  name?: string;
  breed?: string;
  milkCapacityMin: number;
  milkCapacityMax: number;
  ratePerLitre: number;
  lactationStartDate?: Date;
  lactationEndDate?: Date;
  assignedTo?: string | null;
  investmentId?: string | null;
  status: 'available' | 'leased' | 'dry' | 'retired';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}