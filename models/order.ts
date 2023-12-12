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
        order_items: {
            type: Schema.Types.Mixed,
        },
        lender_name: {
            type: String
        },
        lender_address: {
            type: String
        },
        lender_phone_call: {
            type: String
        },
        lender_phone_whatsapp: {
            type: String
        },
        renter_phone_number: {
            type: String
        },
        rental_start_date: {
            type: Date
        },
        rental_end_date: {
            type: Date
        },
        renter_name: {
            type: String
        },
        rental_duration: {
            type: String
        },
        rental_piece_name: {
            type: String
        },
        backup_piece: {
            type: String
        },
        payment_status: {
            type: Boolean
        },
        lenders_share: {
            type: Number,
            default:0
        },
        profit: {
            type: Number,
            default:0
        },
        expenses: {
            type: Number,
            default:0
        },
        rental_fees: {
            type: Number
        },
        returned_to_lender: {
            type: Boolean
        },
        returned_to_lender_by_dry_cleaner: {
            type: Date
        },
        pickup_by_dry_cleaner_from_renter: {
            type: Date
        },
        fitting_date: {
            type: Date
        },
        // fitting_type: {
        //     type: String
        // },
        order_type: {
            type: String
        },
    },
    {
        timestamps: true,
    }
);


export default model<IOrder>('Order', orderSchema);
