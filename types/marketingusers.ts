import { Document, Schema } from 'mongoose';

export interface IMarketingUsers extends Document {
    first_name: string;
    last_name: string;
    phone_number: string;
    isActive: boolean;
    whatsapp_messaging:boolean;
    tags:Schema.Types.Mixed;
    info:Schema.Types.Mixed;
}
