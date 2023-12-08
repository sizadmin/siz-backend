import { ILender } from '../types/lender';
import { model, Schema } from 'mongoose';

const lenderSchema: Schema = new Schema(
    {
        lender_id: {
            type: String,
            unique: true,
        },
        name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        email: {
            type: String
        },
        phone_number_call: {
            type: String
        },
        phone_number_whatsapp: {
            type: String
        },
        shopify_id: {
            type: String
        },
        address: {
            type: String
        },
        account_number: {
            type: String
        },
        iban_number: {
            type: String
        },
        swift_code: {
            type: String
        },
        account_name: {
            type: String
        },
        lender_details: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);


export default model<ILender>('Lender', lenderSchema);
