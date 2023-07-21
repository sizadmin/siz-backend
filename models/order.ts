import { IOrder } from './../types/order';
import { model, Schema } from 'mongoose';

const orderSchema: Schema = new Schema(
    {
        order_id: {
            type: String,
        },
        order_date: {
            type: Date,
        },
        email: {
            type: String
        },
        phone_number: {
            type: String
        },
        order_number: {
            type: Number
        },
        total_price: {
            type: String
        },
        order_details: {
            type: Schema.Types.Mixed,
        },
        order_items : {
            type:Schema.Types.Mixed,
        },
        lender_name:{
            type: String
        },
        lender_address:{
            type: String
        },
        lender_phone_call : {
            type: String
        },
        lender_phone_whatsapp : {
            type: String
        },
    },
    {
        timestamps: true,
    }
);


export default model<IOrder>('Order', orderSchema);
