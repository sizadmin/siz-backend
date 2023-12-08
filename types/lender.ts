import { Document, Schema } from 'mongoose';

export interface ILender extends Document {

    first_name: string;
    last_name: string;
    email: string;
    phone_number_call: string;
    phone_number_whatsapp: string
    shopify_id: string;
    address: string;
    lender_details: Schema.Types.Mixed
    account_number: string;
    iban_number: string;
    swift_code: string;
    account_name: string;
}



