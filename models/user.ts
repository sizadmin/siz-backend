import { IUser } from './../types/user';
import { model, Schema } from 'mongoose';

const userSchema: Schema = new Schema(
    {
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        email: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        phone_number: {
            type: String
        },
        address: {
            type: String
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
        },
        password: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: false
        },
        lender_info: {
            type: Schema.Types.ObjectId,
            ref: 'Lender',
        },
        lender_type: {
            type: String
        },
        profilePicture: {
            type: String,
            default: null
        }

    },
    {
        timestamps: true,
    }
);


export default model<IUser>('User', userSchema);
