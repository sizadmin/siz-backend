import { IContactList } from '../types/conatctlist';
import { model, Schema } from 'mongoose';

const contactListSchema: Schema = new Schema(
    {
        name: {
            type: String
        },
        last_name: {
            type: String
        },
        phone_number: {
            type: [Schema.Types.Mixed]
        },
        isActive: {
            type: Boolean
        },
        select_all: {
            type: Boolean
        }

    },
    {
        timestamps: true,
    }
);


export default model<IContactList>('ContactList', contactListSchema);
