import { model, Schema } from 'mongoose';
import { IWTemplate } from '../types/WTemplate';

const WtemplateSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['CREATED', 'Send For Approval', 'APPROVED', "REJECTED", "PENDING", "UPDATED"], // Enum for status field
            default: 'user',
        },
        body: {
            type: String,
        },
        headerEnabled: {
            type: Boolean,
            required: true
        },
        headerImageUrl: {
            type: String,
        },
        headerText: {
            type: String
        },

        buttonEnabled: {
            type: Boolean,
            required: true
        },
        buttons: {
            type: Schema.Types.Mixed,
        },
        bodyVariables: {
            type: Schema.Types.Mixed,
            default: []
        },
        headerVariables: {
            type: Schema.Types.Mixed,
            default: []
        },
        templateId: {
            type: String
        },
        imageMediaCode: {
            type: String
        },
        footerText: {
            type: String
        }



    },
    {
        timestamps: true,
    }
);


export default model<IWTemplate>('WTemplate', WtemplateSchema);
