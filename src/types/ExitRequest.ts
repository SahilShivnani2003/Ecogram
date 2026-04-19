export interface BankDetails {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
}

export interface ExitRequest {
    _id?: string;
    user: string;
    investment: string;

    requestedAmount: number;
    principalAmount: number;
    earnedAmount: number;

    reason: 'personal' | 'financial' | 'missed_payouts' | 'other';
    reasonDetails?: string;

    status: 'pending' | 'approved' | 'rejected' | 'processed';

    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: Date;

    processedAt?: Date;
    transactionId?: string;

    investmentStartDate: Date;
    monthsCompleted: number;
    lockInPeriodCompleted: boolean;
    consecutivePayoutsMissed: number;
    eligibleForExit: boolean;

    bankDetails?: BankDetails;

    createdAt?: Date;
    updatedAt?: Date;
}