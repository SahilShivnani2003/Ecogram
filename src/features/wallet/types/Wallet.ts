export interface Wallet {
    _id?: string;
    user: string;
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
    rewardPoints: number;
    cashbackBalance: number;
    createdAt?: Date;
    updatedAt?: Date;
}