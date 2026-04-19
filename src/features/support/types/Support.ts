export interface SupportTicket {
    _id?: string;
    user?: string;
    isGuest: boolean;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    subject: string;
    description: string;
    category: 'investment' | 'booking' | 'payment' | 'account' | 'technical' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    adminResponse: string;
    respondedBy?: string;
    respondedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}