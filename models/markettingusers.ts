import { IMarketingUsers } from '../types/marketingusers';
import { model, Schema } from 'mongoose';

const marketingUsersSchema: Schema = new Schema(
    {
        first_name: {
            type: String
        },
        last_name: {
            type: String
        },
        full_name: {
            type: String
        },
        phone_number: {
            type: String,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: false
        },
        whatsapp_messaging: {
            type: Boolean,
            default: true
        },
        user_data: {
            type: Schema.Types.Mixed,
        },
        tags: [{
            type: Schema.Types.Mixed,
        }],
        info:{
            type: Schema.Types.Mixed,
        }

    },
    {
        timestamps: true,
    }
);


export default model<IMarketingUsers>('Marketingusers', marketingUsersSchema);
