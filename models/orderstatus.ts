import { model, Schema } from 'mongoose';
import { IOrderStatus } from '../types/orderstatus';

const productSchema: Schema = new Schema(
    {
        orderID: {
            type: String,
        },
        product_delivery_date: {
            type: Date,
        },
        product_pickup_date: {
            type: Date,
        },
        product_delivery_timeslot: {
            type: String,
        },
        product_pickup_timeslot: {
            type: String,
        },
        notes:{
            type:String
        }
       
    },
    {
        timestamps: true,
    }
);


export default model<IOrderStatus>('orderstatus', productSchema);
