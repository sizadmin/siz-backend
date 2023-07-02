"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/v1/users");
const router = (0, express_1.Router)();
router.get('/users', users_1.getUsers);
router.post('/user', users_1.addUser);
router.put('/user/:id', users_1.updateUser);
router.delete('/user/:id', users_1.deleteUser);
router.post('/login', users_1.loginUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map