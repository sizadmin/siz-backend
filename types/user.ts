import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    role:Schema.Types.ObjectId
    password:string
    isActive:boolean;
    lender_type:string;
}
