export interface GuestDetail {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
}

export interface Booking {
  _id?: string;
  user: string;
  resort: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestDetails: GuestDetail[];
  totalNights: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentId?: string;
  specialRequests?: string;
  createdAt?: Date;
  updatedAt?: Date;
}