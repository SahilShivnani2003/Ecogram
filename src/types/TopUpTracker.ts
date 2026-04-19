export interface TopUpTracker {
    _id?: string;
    user: string;
    financialYear: string;
    count: number;
    investments: string[];
    lastTopUpDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}