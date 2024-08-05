import { Document } from 'mongoose';

export interface IContactList extends Document {
    name: string;
    isActive:boolean;
    phone_numbers:any;
}
