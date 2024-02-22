import express, { Express } from "express"
import mongoose, { ConnectOptions } from "mongoose"
import cors from "cors"
import bodyParser from "body-parser";
// import userRoutes from "./routes/index"
import whatsappRoutes from "./../routes/whatsapp_messsaging_role_route";
import roleRoute from "./../routes/rolesRoutes";
import userRoute from "./../routes/userRoutes";
import webhooks from "./../routes/webhooks";
import orderRoute from "./../routes/orderRoutes";
import dashboardRoute from "./../routes/dashboardRoutes";
import lendersRoute from "./../routes/lensersRoutes";



require("dotenv").config();

const app: Express = express();
const PORT: string | number = process.env.PORT || 5001;
const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, MONGO_URL } = process.env;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
// app.use(express.urlencoded({limit: '50mb'}));

//***init middleware***//

app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/', roleRoute)
app.use('/api/v1/', whatsappRoutes)
app.use('/api/v1/', userRoute)
app.use('/api/v1/', webhooks)
app.use('/api/v1/order-status/', orderRoute)
app.use('/api/v1/dashboard/', dashboardRoute)
app.use('/api/v1/lenders/', lendersRoute)





app.get("/", (req, res) => res.send("Welcome to My-Backend!"));
app.get("/api", (req, res) => res.send("Welcome to My-Backend! API"));

const uri: string = MONGO_URL ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@cluster0.oafna.mongodb.net/${DB_NAME}?authSource=${DB_NAME}&w=1`;

mongoose.set("strictQuery", false);

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(error => {
    console.log(`error : ${error}`);
    throw error;
  });
