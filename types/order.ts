import { Document,Schema } from 'mongoose';

export interface IOrder extends Document {
  
    order_id:string;
    order_date:Date;
    email:string;
    phone_number:string;
    order_details:Schema.Types.Mixed;

}
