import axios from "axios";

require("dotenv").config();

const ZOHO_URL = "https://books.zoho.com/api/v3";

const getZohoAccessToken = async () => {
  try {
    const response = await axios.post("https://accounts.zoho.com/oauth/v3/token", null, {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        grant_type: "refresh_token",
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error.response ? error.response.data : error.message);
  }
};

const getInvoices = async () => {
  const accessToken = await getZohoAccessToken();

  const response = await axios.get(ZOHO_URL + "/invoices", {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
      "X-com-zoho-organizationid": process.env.ORGANIZATION_ID,
    },
  });

  console.log(response.data);
};

const createInvoice = async (invoice: any) => {
  const accessToken = await getZohoAccessToken();

  const invoiceData = {
    customer_id: invoice.customer_id,
    line_items: invoice.items.map((item: any) => ({
      name: item.name,
      rate: item.price,
      quantity: item.quantity,
    })),
    total: invoice.total,
  };

  const response = await axios.post(ZOHO_URL + "/invoices", invoiceData, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
      "X-com-zoho-organizationid": process.env.ORGANIZATION_ID,
    },
  });

  console.log(response.data);
};

const addCustomer = async (customer: any) => {
  const accessToken = await getZohoAccessToken();

  const response = await axios.post(
    ZOHO_URL + "/customers",
    {
      contact_name: customer.name,
      company_name: customer.company,
      email: customer.email,
      phone: customer.phone,
      billing_address: {
        address: customer.address,
        city: customer.city,
        country: customer.country,
      },
    },
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "X-com-zoho-organizationid": process.env.ORGANIZATION_ID,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Customer Added:", response.data);
};

export { getZohoAccessToken, getInvoices, createInvoice, addCustomer };
