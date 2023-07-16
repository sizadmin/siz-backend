"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
// import userRoutes from "./routes/index"
const whatsapp_messsaging_role_route_1 = __importDefault(require("./../routes/whatsapp_messsaging_role_route"));
const rolesRoutes_1 = __importDefault(require("./../routes/rolesRoutes"));
const userRoutes_1 = __importDefault(require("./../routes/userRoutes"));
const webhooks_1 = __importDefault(require("./../routes/webhooks"));
const orderRoutes_1 = __importDefault(require("./../routes/orderRoutes"));
require("dotenv").config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, MONGO_URL } = process.env;
app.use((0, cors_1.default)());
//***init middleware***//
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/api/v1/', rolesRoutes_1.default);
app.use('/api/v1/', whatsapp_messsaging_role_route_1.default);
app.use('/api/v1/', userRoutes_1.default);
app.use('/api/v1/', webhooks_1.default);
app.use('/api/v1/', orderRoutes_1.default);
app.get("/", (req, res) => res.send("Welcome to My-Backend!"));
app.get("/api", (req, res) => res.send("Welcome to My-Backend! API"));
const uri = MONGO_URL !== null && MONGO_URL !== void 0 ? MONGO_URL : `mongodb://${DB_USERNAME}:${DB_PASSWORD}@cluster0.oafna.mongodb.net/${DB_NAME}?authSource=${DB_NAME}&w=1`;
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch(error => {
    console.log(`error : ${error}`);
    throw error;
});
//# sourceMappingURL=app.js.map