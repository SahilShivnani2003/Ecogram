export interface ContactInquiry {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'closed';
  adminResponse: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}