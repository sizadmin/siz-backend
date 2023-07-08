"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_1 = require("../controllers/v1/whatsapp");
const shopify_1 = require("../controllers/v1/shopify");
const router = (0, express_1.Router)();
router.post('/msg', whatsapp_1.sendWhatsappMsg);
router.get('/fetchOrders', shopify_1.fetchShopifyOrder);
router.get('/fetchProducts', shopify_1.fetchShopifyProducts);
router.get('/fetchLenders', shopify_1.fetchShopifyLenders);
router.get('/order/:id', shopify_1.getOrderById);
exports.default = router;
//# sourceMappingURL=whatsapp_messsaging_role_route.js.map