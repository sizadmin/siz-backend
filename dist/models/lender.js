"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const lenderSchema = new mongoose_1.Schema({
    lender_id: {
        type: String,
    },
    name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String
    },
    phone_number_call: {
        type: String
    },
    phone_number_whatsapp: {
        type: String
    },
    shopify_id: {
        type: String
    },
    address: {
        type: String
    },
    lender_details: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Lender', lenderSchema);
//# sourceMappingURL=lender.js.map