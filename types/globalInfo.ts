import { Document } from 'mongoose';

export interface IGlobalInfo extends Document {
    access_token: string;
    expires_at:any;
}
