import { findRecordsLastXMinutes } from "./globalFunc";
require("dotenv").config();
let options = { new: true };

const fetchProductsWebhook = async (req: any, res: any) => {
  let findData = await findRecordsLastXMinutes("siz_users", "*", "created_at", 30); // Last 30 minutes
  res.status(200).json(findData);
};

export { fetchProductsWebhook };
