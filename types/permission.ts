import { Date, Document, Schema } from 'mongoose';

export interface IPermissions extends Document {
    name: string;
}