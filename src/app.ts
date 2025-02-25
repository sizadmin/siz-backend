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
import lendersRoute from "../routes/lendersRoutes";
import contactListRoutes from "./../routes/contactListRoutes";
import marketingUsersRoutes from "./../routes/marketingUsers";
import campaignRoutes from "./../routes/campaignRoutes"
import templateRoutes from "./../routes/template"
import permissionRoutes from "./../routes/permissionRoutes"
import appRoutes from "./../routes/mysqlRoutes/routes"
import zohoRoutes from "./../routes/zohoBooksRoutes/zohoBooksRoutes"

import mysql from "mysql2"
import axios from "axios";
require("dotenv").config();

// Your Zoho credentials from the .env file
const {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URI,
  ZOHO_API_URL,
} = process.env;


const app: Express = express();
const PORT: string | number = process.env.PORT || 5001;
const { DB_USERNAME, DB_PASSWORD, DB_NAME, MONGO_URL, MYSQL_HOST, MYSQL_USER_NAME, MYSQL_PASSWORD, MYSQL_DB_NAME } = process.env;

app.use(cors());
app.use(express.text({ type: 'text/csv' })); // To handle raw CSV text
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

//***init middleware***//

app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json');
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', }));
app.use('/api/v1/', roleRoute)
app.use('/api/v1/', whatsappRoutes)
app.use('/api/v1/', userRoute)
app.use('/api/v1/', webhooks)
app.use('/api/v1/order-status/', orderRoute)
app.use('/api/v1/dashboard/', dashboardRoute)
app.use('/api/v1/lenders/', lendersRoute)
app.use('/api/v1/contact_list/', contactListRoutes)
app.use('/api/v1/marketing_users/', marketingUsersRoutes)
app.use('/api/v1/campaign/', campaignRoutes)
app.use('/api/v1/template/', templateRoutes)
app.use('/api/v1/permission/', permissionRoutes)
app.use('/api/v1/siz-app/', appRoutes)
app.use('/api/v1/zoho-books/', zohoRoutes)




// Step 1: Redirect to Zoho's OAuth authorization endpoint
app.get('/api/v1/zoho-books/oauth', (req, res) => {
  const authURL =`${ZOHO_API_URL}/auth?scope=ZohoBooks.fullaccess.all&client_id=${ZOHO_CLIENT_ID}&redirect_uri=${ZOHO_REDIRECT_URI}&response_type=code`;
  console.log(authURL,"authURL")
  res.redirect(authURL);
});

// Step 2: Handle the OAuth callback to get the authorization code
app.get('/api/v1/zoho-books/oauth/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code,"code");

  if (!code || typeof code !== 'string') {
    return res.status(400).send('Authorization code is missing or invalid');
  }

  try {
    // Step 3: Exchange authorization code for access token
    const response = await axios.post(
      `${ZOHO_API_URL}/token`,
      new URLSearchParams({
        code,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        redirect_uri: ZOHO_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log(response.data,"response.data");
    // Save the tokens or send them as a response (You can save them in a database or in memory)
    res.json({
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error) {
    console.error('Error while exchanging authorization code:', error);
    res.status(500).send('Failed to get access token');
  }
});

// Step 4: Refresh access token using refresh token
app.get('/api/v1/zoho-books/refresh-token', async (req, res) => {
  const { refresh_token } = req.query;
  console.log(refresh_token,"refresh_token");
  if (!refresh_token) {
    return res.status(400).send('Refresh token is missing');
  }

  try {
    const response = await axios.post(
      `${ZOHO_API_URL}/token`,
      new URLSearchParams({
        refresh_token: refresh_token as string,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;
    console.log(response.data,"response.data");
    res.json({
      access_token,
      expires_in,
    });
  } catch (error) {
    console.error('Error while refreshing access token:', error);
    res.status(500).send('Failed to refresh access token');
  }
});




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




// Configure MySQL
const mysqlConnection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER_NAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB_NAME,
});

// Connect to MySQL
mysqlConnection.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error: ', err);
    return;
  }
  console.log('Connected to MySQL');
});
export { mysqlConnection }