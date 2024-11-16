import { Document, Schema } from 'mongoose';

export interface IWhatsappMessage extends Document {

    name: string;
    phone_number: string;
    message: string
    timestamp: string;
    log:Schema.Types.Mixed;
}



