import { Document, Schema } from 'mongoose';

export interface IOrderStatus extends Document {
    orderID: String;
    product_delivery_date: Date;
    product_pickup_date: Date;
    notes: String;
    product_pickup_timeslot:String;
    product_delivery_timeslot:String;
}
