
import { model, Schema } from 'mongoose';
import { IPermissions } from '../types/permission';

const permissionSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
    }
);


export default model<IPermissions>('Permission', permissionSchema);
