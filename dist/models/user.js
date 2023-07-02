"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
    phone_number: {
        type: String
    },
    address: {
        type: String
    },
    role: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Role',
    },
    password: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=user.js.map