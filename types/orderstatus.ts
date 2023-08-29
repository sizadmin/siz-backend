import { Document, Schema } from 'mongoose';

export interface IOrderStatus extends Document {
    orderID: string;
    product_delivery_date: Date;
    product_pickup_date: Date;
    notes: string;
    product_pickup_timeslot:string;
    product_delivery_timeslot:string;
    product_pickup_date_from_renter:Date;
    product_pickup_timeslot_from_renter :string; 
    product_delivery_date_to_lender:Date;
    product_delivery_timeslot_to_lender :string ;
}
