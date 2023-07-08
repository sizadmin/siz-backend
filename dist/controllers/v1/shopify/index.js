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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderById = exports.fetchShopifyLenders = exports.fetchShopifyProducts = exports.fetchShopifyOrder = void 0;
const axios_1 = __importDefault(require("axios"));
const order_1 = __importDefault(require("../../../models/order"));
const product_1 = __importDefault(require("../../../models/product"));
const fetchShopifyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/orders.json?status=any&created_at_min=2023-06-20T00:00:00-00:00`;
        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = yield axios_1.default.get(url, config);
        try {
            // const response = await axios.post(
            //     '/api/webhook',
            //     {},
            //     {
            //       headers: {
            //         'X-Shopify-Hmac-Sha256': process.env.REACT_APP_SHOPIFY_WEBHOOK_SECRET,
            //       },
            //     }
            //   );
            for (var _d = true, _e = __asyncValues(response.data.orders), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const order = _c;
                    const findOrder = yield order_1.default.find({
                        $and: [
                            { order_id: order.id },
                        ],
                    });
                    if (findOrder.length == 0) {
                        const newOrder = new order_1.default({
                            order_id: order.id,
                            order_date: order.created_at,
                            email: order.contact_email,
                            phone_number: order.phone,
                            order_details: order,
                            order_number: order.order_number,
                            total_price: order.total_price
                        });
                        const savedOrder = yield newOrder.save();
                    }
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        res.status(200).json({
            success: true,
            message: "Shopify orders fetched successfully.",
            // data: response.data
        });
    }
    catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify orders:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify orders" });
    }
});
exports.fetchShopifyOrder = fetchShopifyOrder;
const fetchShopifyProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, e_2, _h, _j;
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/products.json`;
        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = yield axios_1.default.get(url, config);
        try {
            for (var _k = true, _l = __asyncValues(response.data.products), _m; _m = yield _l.next(), _g = _m.done, !_g;) {
                _j = _m.value;
                _k = false;
                try {
                    const product = _j;
                    console.log(response.data.products.length);
                    const findProduct = yield product_1.default.find({
                        $and: [
                            { product_id: product.id },
                        ],
                    });
                    if (findProduct.length == 0) {
                        const newProduct = new product_1.default({
                            product_id: product.id,
                            product_name: product.title,
                            product_created_date: product.created_at,
                            product_details: product
                        });
                        const savedProduct = yield newProduct.save();
                    }
                }
                finally {
                    _k = true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_k && !_g && (_h = _l.return)) yield _h.call(_l);
            }
            finally { if (e_2) throw e_2.error; }
        }
        res.status(200).json({
            success: true,
            message: "Shopify products fetched successfully.",
            data: response.data
        });
    }
    catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify products:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
});
exports.fetchShopifyProducts = fetchShopifyProducts;
const fetchShopifyLenders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let url = `https://siz-ae.myshopify.com/admin/products/7697209852124/metafields.json`;
        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = yield axios_1.default.get(url, config);
        // for await (const product of response.data.products) {
        //     const findProduct: Array<IProduct> | null = await Product.find({
        //         $and: [
        //             { product_id: product.id },
        //         ],
        //     });
        //     if (findProduct.length == 0) {
        //         const newProduct: IProduct = new Product({
        //             product_id: product.id,
        //             product_name: product.title,
        //             product_created_date: product.created_at,
        //             product_details: product
        //         });
        //         const savedProduct: IProduct = await newProduct.save();
        //     }
        // }
        res.status(200).json({
            success: true,
            message: "Shopify products fetched successfully.",
            data: response.data
        });
    }
    catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify products:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
});
exports.fetchShopifyLenders = fetchShopifyLenders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orderID = req.params.id;
        console.log(orderID);
        const findOrder = yield order_1.default.find({ order_id: orderID });
        console.log(findOrder);
        res.status(200).json({
            success: true,
            message: "Shopify product fetched successfully.",
            data: findOrder
        });
    }
    catch (err) {
        console.error("Failed to fetch shopify products:", err);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify product" });
    }
});
exports.getOrderById = getOrderById;
//# sourceMappingURL=index.js.map