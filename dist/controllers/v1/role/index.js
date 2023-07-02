"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRole = exports.getRoles = void 0;
const role_1 = __importDefault(require("../../../models/role"));
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_1.default.find();
        res.status(200).json({ count: roles.length, results: roles });
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.getRoles = getRoles;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const roles = yield role_1.default.findOne({
            role_name: body.name,
        });
        if (roles) {
            res.status(400).json({
                message: 'Role Already Exists',
            });
            return;
        }
        const newRole = new role_1.default({
            role_name: body.name,
        });
        const savedUser = yield newRole.save();
        res.status(201).json({ message: 'Role added', result: [savedUser] });
        return;
    }
    catch (error) {
        res.status(400).json({ error });
        throw error;
    }
});
exports.createRole = createRole;
//# sourceMappingURL=index.js.map