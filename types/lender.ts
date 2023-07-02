import { Document, Schema } from 'mongoose';

export interface ILender extends Document {

    lender_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number_call: string;
    phone_number_whatsapp: string
    shopify_id: string;
    address: string;
    lender_details: Schema.Types.Mixed
}



