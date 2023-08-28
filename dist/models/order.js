"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    order_id: {
        type: String,
    },
    order_date: {
        type: Date,
    },
    email: {
        type: String
    },
    phone_number: {
        type: String
    },
    order_number: {
        type: Number
    },
    total_price: {
        type: String
    },
    order_details: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    order_items: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    lender_name: {
        type: String
    },
    lender_address: {
        type: String
    },
    lender_phone_call: {
        type: String
    },
    lender_phone_whatsapp: {
        type: String
    },
    renter_phone_number: {
        type: String
    },
    rental_start_date: {
        type: String
    },
    rental_end_date: {
        type: String
    },
    renter_name: {
        type: String
    },
    rental_duration: {
        type: String
    },
    rental_piece_name: {
        type: String
    },
    backup_piece: {
        type: String
    }
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Order', orderSchema);
//# sourceMappingURL=order.js.map