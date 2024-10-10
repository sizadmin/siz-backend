import { Document } from 'mongoose';

export interface ICronJob extends Document {
    name: string;
    updatedAt: Date;
    timestamp: string;
}
