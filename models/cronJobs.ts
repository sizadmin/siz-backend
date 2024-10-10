import { ICronJob } from '../types/cronJob';
import { model, Schema } from 'mongoose';

const CronJobsSchema: Schema = new Schema(
    {
        name: {
            type: String,
        },
        timestamp: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);


export default model<ICronJob>('CronJob', CronJobsSchema);
