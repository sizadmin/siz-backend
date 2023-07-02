
import { Document, Schema } from 'mongoose';

export interface IProduct extends Document {

    product_id: string;
    product_created_date: Date;
    product_name: string;
    product_details: Schema.Types.Mixed;

}
