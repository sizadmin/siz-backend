import { Document, Schema } from 'mongoose';

export interface IOrder extends Document {

    order_id: string;
    order_date: Date;
    email: string;
    phone_number: string;
    order_details: Schema.Types.Mixed;
    order_items: Schema.Types.Mixed;
    lender_name: string;
    lender_address: string;
    lender_phone_call: string;
    lender_phone_whatsapp: string;
    renter_phone_number: string;
    rental_start_date: Date;
    rental_end_date: Date;
    renter_name: string;
    rental_duration: string;
    rental_piece_name: string;
    backup_piece: string;

    payment_status: Boolean;
    lenders_share: Number;
    profit: Number;
    expenses: Number;
    rental_fees: Number;
    returned_to_lender: Boolean;
    returned_to_lender_by_dry_cleaner: Date;
    pickup_by_dry_cleaner_from_renter: Date;
    fitting_date: Date;
    order_type: string;
}
