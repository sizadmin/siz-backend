import { Date, Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
    name: string;
    isActive: boolean;
    contact_list: Schema.Types.ObjectId;
    schedule_date: Date;
    // template: Schema.Types.ObjectId;
}