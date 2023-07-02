import { Document, Schema } from 'mongoose';

export interface IRole extends Document {
    role_name: string;

}
