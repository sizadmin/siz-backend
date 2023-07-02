import { IRole } from './../types/role';
import { model, Schema } from 'mongoose';

const roleSchema: Schema = new Schema(
    {
        role_name: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);


export default model<IRole>('Role', roleSchema);
