"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    product_id: {
        type: String,
    },
    product_created_date: {
        type: Date,
    },
    product_name: {
        type: String
    },
    product_details: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Product', productSchema);
//# sourceMappingURL=product.js.map