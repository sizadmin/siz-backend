import axios from "axios";

require("dotenv").config();

const ZOHO_URL = "https://www.zohoapis.com/books/v3";
const { ZOHO_API_URL, ZOHO_ORGANIZATION_ID, ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REDIRECT_URI } = process.env;

const getZohoAccessToken = async () => {
  try {
    const response = await axios.post(ZOHO_API_URL + "/token", null, {
      params: {
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        refresh_token: ZOHO_REFRESH_TOKEN,
        grant_type: "refresh_token",
      },
    });

    // Save new token & expiry time
    let accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error.response ? error.response.data : error.message);
  }
};

const getInvoices = async (req:any, res:any) => {
  try {
    let access_token = await getZohoAccessToken();
    const response = await axios.get(ZOHO_URL + "/invoices" + "?organization_id=" + ZOHO_ORGANIZATION_ID, {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json",
        "X-com-zoho-organizationid": process.env.ZOHO_ORGANIZATION_ID,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.log("Invoice Error:", error);
    res.status(400).json(error);
  }
};

const getCustomer = async (req: any, res: any) => {
  try {
    let access_token = await getZohoAccessToken();
    const response = await axios.get(ZOHO_URL + "/customers" + "?organization_id=" + ZOHO_ORGANIZATION_ID, {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json",
        "X-com-zoho-organizationid": process.env.ZOHO_ORGANIZATION_ID,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.log("Customer Error:", error);
    res.status(400).json(error);
  }
};

const createInvoice = async (req:any,res:any) => {
  try {
    const accessToken = await getZohoAccessToken();
    const invoiceData = {
      customer_id: "6129386000000103001",
      // line_items: invoice.items.map((item: any) => ({
      //   name: item.name,
      //   rate: item.price,
      //   quantity: item.quantity,
      // })),
      line_items: [
        {
          name: "testp 1",
          rate: 90,
          quantity: 1,
        },
      ],
      total: 90,
    };

    const response = await axios.post(ZOHO_URL + "/invoices", invoiceData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
        "X-com-zoho-organizationid": process.env.ZOHO_ORGANIZATION_ID,
      },
    });

    // console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log("Invoice Error:", error);
    res.status(400).json(error);
  }
};

const addCustomer = async (req: any, res: any) => {
  try {
    const accessToken = await getZohoAccessToken();
    const customer: any = {
      name: "Deepak",
      company: "Deepak",
      email: "deepakbhangale1996@gmail.com",
      phone: "09405744310",
      address: "pune",
      city: "pune",
      state: "maharastra",
      country: "india",
    };
    const response = await axios.post(
      ZOHO_URL + "/contacts",
      {
        contact_name: customer.name,
        billing_address: {
          address: customer.address,
          city: customer.city,
          country: customer.country,
        },
        contact_persons: [
          {
            salutation: "Mr",
            first_name: "Deepak",
            last_name: "Bhangale",
            email: "deepakbhangale1996@gmail.com",
            phone: "",
            mobile: "09405744310",
            is_primary_contact: true,
          },
        ],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "X-com-zoho-organizationid": process.env.ZOHO_ORGANIZATION_ID,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Customer Added:", error);
    res.status(400).json(error);
  }
};
// Step 1: Redirect to Zoho's OAuth authorization endpoint
const oauth = (req: any, res: any) => {
  try {
    const authURL = `${ZOHO_API_URL}/auth?scope=ZohoBooks.fullaccess.all&client_id=${ZOHO_CLIENT_ID}&redirect_uri=${ZOHO_REDIRECT_URI}&response_type=code&access_type=offline&prompt=consent`;
    console.log(authURL, "authURL");
    res.redirect(authURL);
  } catch (error) {
    console.log("Error in oauth", error);
  }
};

// Step 2: Handle the OAuth callback to get the authorization code

const oauthCallback = async (req: any, res: any) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).send("Authorization code is missing or invalid");
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
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log(response.data, "response.data");
    // Save the tokens or send them as a response (You can save them in a database or in memory)
    res.json({
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error) {
    console.error("Error while exchanging authorization code:", error);
    res.status(500).send("Failed to get access token");
  }
};

// Step 4: Refresh access token using refresh token

const oauthRefreshToken = async (req: any, res: any) => {
  const { refresh_token } = req.query;
  console.log(refresh_token, "refresh_token");
  if (!refresh_token) {
    return res.status(400).send("Refresh token is missing");
  }

  try {
    const response = await axios.post(
      `${ZOHO_API_URL}/token`,
      new URLSearchParams({
        refresh_token: refresh_token as string,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, expires_in } = response.data;
    res.json({
      access_token,
      expires_in,
    });
  } catch (error) {
    console.error("Error while refreshing access token:", error);
    res.status(500).send("Failed to refresh access token");
  }
};

export { getZohoAccessToken, getInvoices, createInvoice, addCustomer, getCustomer, oauth, oauthCallback, oauthRefreshToken };
