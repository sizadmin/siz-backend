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
exports.sendDeliveryReminderToRenter = exports.getOrderById = exports.fetchShopifyLenders = exports.fetchShopifyProducts = exports.fetchShopifyOrder = void 0;
const axios_1 = __importDefault(require("axios"));
const order_1 = __importDefault(require("../../../models/order"));
const product_1 = __importDefault(require("../../../models/product"));
const product_2 = __importDefault(require("../../../models/product"));
const lender_1 = __importDefault(require("../../../models/lender"));
const fetchShopifyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e;
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/orders.json?status=any&created_at_min=2023-01-01T00:00:00-00:00&limit=250`;
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
            for (var _f = true, _g = __asyncValues(response.data.orders), _h; _h = yield _g.next(), _a = _h.done, !_a;) {
                _c = _h.value;
                _f = false;
                try {
                    const order = _c;
                    const findOrder = yield order_1.default.find({
                        $and: [
                            { order_id: order.id },
                        ],
                    });
                    if (findOrder.length == 0) {
                        let product_title = (_d = order.line_items[0]) === null || _d === void 0 ? void 0 : _d.title;
                        const findProduct = yield product_2.default.findOne({
                            "product_details.title": product_title
                        });
                        let tags = (_e = findProduct === null || findProduct === void 0 ? void 0 : findProduct.product_details) === null || _e === void 0 ? void 0 : _e.tags;
                        const regex = /(influencer_[A-Za-z0-9_]+)/;
                        const matches = tags === null || tags === void 0 ? void 0 : tags.match(regex);
                        let influencerTag = "";
                        let lender_name = "";
                        let lender_address = "";
                        let lender_phone_call = "";
                        let lender_phone_whatsapp = "";
                        if (matches && matches.length >= 2) {
                            influencerTag = matches[1];
                            console.log("Influencer Tag:", influencerTag);
                            const findLender = yield lender_1.default.findOne({
                                "shopify_id": influencerTag
                            });
                            lender_name = findLender ? findLender.name : "Not Found";
                            lender_address = findLender ? findLender.address : "Not Found";
                            lender_phone_call = findLender ? findLender.phone_number_call : "Not Found";
                            lender_phone_whatsapp = findLender ? findLender.phone_number_whatsapp : "Not Found";
                        }
                        else {
                            console.log("Influencer Tag not found.");
                        }
                        const newOrder = new order_1.default({
                            order_id: order.id,
                            order_date: order.created_at,
                            email: order.contact_email,
                            phone_number: order.phone,
                            order_details: order,
                            order_number: order.order_number,
                            total_price: order.total_price,
                            lender_name: lender_name,
                            lender_address: lender_address,
                            lender_phone_call: lender_phone_call,
                            lender_phone_whatsapp: lender_phone_whatsapp,
                        });
                        const savedOrder = yield newOrder.save();
                    }
                }
                finally {
                    _f = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = _g.return)) yield _b.call(_g);
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
const sendDeliveryReminderToRenter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        // Subtract one day from the current date to get yesterday's date
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        console.log("TOMORROW:" + tomorrow);
    }
    catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to send reminder to renter", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to send reminder to renter" });
    }
});
exports.sendDeliveryReminderToRenter = sendDeliveryReminderToRenter;
const fetchShopifyProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, e_2, _k, _l;
    try {
        const today = new Date();
        // Subtract one day from the current date to get yesterday's date
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().replace("Z", "-04:00");
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/products.json?created_at_min=` + formattedYesterday;
        console.log("URL : ", url);
        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = yield axios_1.default.get(url, config);
        try {
            for (var _m = true, _o = __asyncValues(response.data.products), _p; _p = yield _o.next(), _j = _p.done, !_j;) {
                _l = _p.value;
                _m = false;
                try {
                    const product = _l;
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
                    _m = true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_m && !_j && (_k = _o.return)) yield _k.call(_o);
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