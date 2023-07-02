"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../controllers/v1/role");
const router = (0, express_1.Router)();
router.get('/roles', role_1.getRoles);
router.post('/roles', role_1.createRole);
exports.default = router;
//# sourceMappingURL=rolesRoutes.js.map