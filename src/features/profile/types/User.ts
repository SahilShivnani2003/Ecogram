export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'customer' | 'investor';
  avatar?: string;
  isActive: boolean;
  address?: UserAddress;
  referralCode?: string;
  rewardPoints: number;
  cashbackReceived: boolean;
  cashbackReceivedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateUser {
  email: string;
  name: string;
  phone: string;
}