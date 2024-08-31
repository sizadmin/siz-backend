import { Document } from 'mongoose';

export interface IMarketingUsers extends Document {
    first_name: string;
    last_name: string;
    phone_number: string;
    isActive: boolean;
    whatsapp_messaging:boolean;
}
