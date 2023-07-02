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
exports.updateUser = exports.loginUser = exports.deleteUser = exports.addUser = exports.getUsers = void 0;
const role_1 = __importDefault(require("../../../models/role"));
const user_1 = __importDefault(require("../../../models/user"));
const mongodb_1 = require("mongodb");
var _ = require('lodash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CONFIG = process.env;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.query.client !== undefined && req.query.client == 'true') {
            let users = yield user_1.default.find().select('-password ').populate('role').sort({ account_name: 1 });
            users = yield _.filter(users, function (o) {
                var _a;
                return ((_a = o.role) === null || _a === void 0 ? void 0 : _a.role_name) == 'Client';
            });
            res.status(200).json({ results: users });
            return;
        }
        else {
            const page = Number(req.query.page) || 1;
            const size = Number(req.query.size) || 10;
            const searchAccName = req.query.searchAccName;
            let MatchQuery = {};
            if (searchAccName)
                MatchQuery.account_name = { $regex: searchAccName, $options: 'i' };
            const agg = [
                {
                    $match: MatchQuery,
                },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        first_name: 1,
                        isActive: 1,
                        last_name: 1,
                        phone_number: 1,
                        role: 1,
                        address: 1
                    },
                },
                { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'role' } },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }, { $addFields: { page: Number(page) } }],
                        data: [{ $skip: (page - 1) * size }, { $limit: size }],
                    },
                },
            ];
            const aggregatedData = yield user_1.default.aggregate(agg);
            const users = {};
            users.data = aggregatedData[0].data.map((user) => (Object.assign(Object.assign({}, user), { role: user.role[0] })));
            users.metadata = aggregatedData[0].metadata;
            res.status(200).json({ metadata: users.metadata, results: users.data });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
});
exports.getUsers = getUsers;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        let roles = yield role_1.default.find({ _id: new mongodb_1.ObjectId(body.role) });
        const user = yield user_1.default.findOne({
            email: body.email,
        });
        if (user) {
            res.status(400).json({
                message: 'Users Already Exists',
            });
            return;
        }
        let selectedRole = roles[0];
        const newUser = new user_1.default({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            role: body.role,
        });
        const salt = yield bcrypt.genSalt(10);
        newUser.password = yield bcrypt.hash(body.password, salt);
        const savedUser = yield newUser.save();
        res.status(201).json({ message: 'User added', result: [savedUser] });
        return;
    }
    catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
});
exports.addUser = addUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        let roles = yield role_1.default.find({});
        if (body.password) {
            const salt = yield bcrypt.genSalt(10);
            body.password = yield bcrypt.hash(body.password, salt);
        }
        let options = { new: true };
        const updateUser = yield user_1.default.findByIdAndUpdate({ _id: id }, body, options).select('-password').populate('role');
        res.status(200).json({
            message: 'User updated',
            result: updateUser,
        });
        return;
    }
    catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield user_1.default.findByIdAndRemove(req.params.id);
        res.status(200).json({
            message: 'User deleted',
            result: [deletedUser],
        });
        return;
    }
    catch (error) {
        res.status(400).json({ error });
        throw error;
    }
});
exports.deleteUser = deleteUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const loggedUser = yield user_1.default.findOne({
            email: body.email,
        }).populate('role');
        if (!loggedUser) {
            res.status(400).json({
                message: 'Incorrect Email/Password',
            });
            return;
        }
        if (loggedUser.isActive === false) {
            res.status(400).json({
                message: 'Your account has been disabled please contact the administrator.',
            });
            return;
        }
        //   compare the saved password with login Password
        const isMatch = yield bcrypt.compare(body.password, loggedUser.password);
        if (!isMatch) {
            res.status(400).json({
                message: 'Incorrect Email/Password',
            });
            return;
        }
        const payload = {
            user: loggedUser,
        };
        //   generating the Token
        jwt.sign(payload, CONFIG.TOKEN_KEY, {
            expiresIn: '30m',
        }, (err, token) => {
            if (err) {
                res.status(400).json({
                    message: 'Incorrect Email/Password',
                });
                throw err;
            }
            user_1.default.findOneAndUpdate({ _id: loggedUser._id }, { lastLogin: new Date() })
                .populate('role')
                .then(ud => {
                return res.status(200).json({
                    token,
                    loggedUser: ud,
                });
            });
        });
    }
    catch (error) {
        res.status(400).json({ error });
        throw error;
    }
});
exports.loginUser = loginUser;
//# sourceMappingURL=index.js.map