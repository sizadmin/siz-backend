"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
// import googleRoutes from "./routes/googleAdapterRoutes"
// import callRailDetailsRoute from "./routes/callRailDetailsRoutes";
// import roleRoute from "./routes/roleAdapterRoutes";
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv").config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, MONGO_URL } = process.env;
app.use((0, cors_1.default)());
//***init middleware***//
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/api/v1/', index_1.default);
// app.use('/api/v1/', googleRoutes)
// app.use('/api/v1/', callRailDetailsRoute)
// app.use('/api/v1/', roleRoute)
app.get("/", (req, res) => res.send("Welcome to My-Backend!"));
app.get("/api", (req, res) => res.send("Welcome to My-Backend! API"));
// const uri: string = MONGO_URL ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?authSource=${DB_NAME}&w=1`;
const connectionString = 'mongodb+srv://deepak:8ZIB5gXdg0Osnjww@cluster0.oafna.mongodb.net/whatsapp_messsaging?retryWrites=true&w=majority';
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch(error => {
    console.log(`error : ${error}`);
    throw error;
});
//# sourceMappingURL=app.js.map