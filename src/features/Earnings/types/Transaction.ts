export interface TransactionBankDetails {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
}

export interface Transaction {
    _id?: string;
    user: string;
    amount: number;
    currency: string;
    paymentMethod: 'razorpay' | 'phonepe' | 'manual' | 'bank_transfer';
    paymentStatus: 'created' | 'paid' | 'failed' | 'refunded' | 'pending' | 'approved' | 'rejected';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    transactionType: 'booking' | 'investment' | 'withdrawal';
    referenceId?: string;
    description?: string;

    withdrawalType: 'wallet' | 'cashback' | 'rewards';
    bankDetails?: TransactionBankDetails;
    adminNotes?: string;
    processedBy?: string;
    processedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}