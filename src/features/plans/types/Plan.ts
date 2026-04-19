export interface Plan {
    _id?: string;
    name: string;
    description?: string;
    isActive: boolean;
    planType: 'land' | 'cow';

    returnRate: number;
    durationMonths: number;
    minAmount: number;

    pricePerSqft?: number;
    sizes?: number[];

    investorPercentage: number;
    companyPercentage: number;
    cowPriceMin?: number;
    cowPriceMax?: number;
    maxCowsPerPerson?: number;
    milkCapacityMin?: number;
    milkCapacityMax?: number;
    ratePerLitre?: number;
    lactationMonths?: number;
    renewalAvailable: boolean;
    buyBackOption?: string;
    profitSharingFrequency?: string;
    cowImages?: string[];

    paymentMode: string;
    guaranteedDailyIncome?: number;

    topUpLimit: number;
    referralIncentive: number;
    cashbackPercentage: number;
    rewardPoints: number;
    luxuryStaysPerYear: number;

    products?: string[];
    features?: string[];

    createdBy?: string;

    createdAt?: Date;
    updatedAt?: Date;
}