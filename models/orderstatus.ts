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
        },
        product_pickup_date_from_renter : {
            type: Date,
        },
        product_pickup_timeslot_from_renter : {
            type: String,
        },
        product_delivery_date_to_lender:{
            type: Date,
        },
        product_delivery_timeslot_to_lender : {
            type: String,
        },

        return_picked_up : {
            type : String,
        }

       
    },
    {
        timestamps: true,
    }
);


export default model<IOrderStatus>('orderstatus', productSchema);
