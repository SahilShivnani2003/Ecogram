export interface CreateUser {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'admin' | 'customer' | 'investor';
    referralCode: string;
}