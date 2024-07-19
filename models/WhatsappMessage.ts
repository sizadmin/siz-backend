import { IWhatsappMessage } from '../types/whatsappMessage';
import { model, Schema } from 'mongoose';

const whatsappMessageSchema: Schema = new Schema(
    {
        name: {
            type: String,
        },
        phone_number: {
            type: String
        },
        message: {
            type: String
        },
        timestamp :{
            type: Date 
        }
    },
    {
        timestamps: true,
    }
);


export default model<IWhatsappMessage>('WhatsappMessage', whatsappMessageSchema);
