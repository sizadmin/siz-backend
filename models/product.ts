import { IProduct } from './../types/product';
import { model, Schema } from 'mongoose';

const productSchema: Schema = new Schema(
    {
        product_id: {
            type: String,
        },
        product_created_date: {
            type: Date,
        },
        product_name: {
            type: String
        },
        product_details: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);


export default model<IProduct>('Product', productSchema);
