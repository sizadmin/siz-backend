import { model, Schema } from "mongoose";
import { IGlobalInfo } from "../types/globalInfo";

const globalInfoSchema: Schema = new Schema(
  {
    access_token: String,
    expires_at: Number, // Store expiry timestamp in seconds
  },
  {
    timestamps: true,
  }
);

export default model<IGlobalInfo>("GlobalInfo", globalInfoSchema);
