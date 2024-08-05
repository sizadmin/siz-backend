import { ICampaign } from '../types/campaign';
import { model, Schema } from 'mongoose';

const campaignSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        schedule_date: {
            type: Date,
            required: true
        },
        contact_list: {
            type: Schema.Types.ObjectId,
            ref: 'ContactList',
            required: true
        },
        template: {
            // type: Schema.Types.ObjectId,
            //     ref: 'Template',
            type: Schema.Types.Mixed,
        },
        isActive: {
            type: Boolean
        },


    },
    {
        timestamps: true,
    }
);


export default model<ICampaign>('Campaign', campaignSchema);
