import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { addCustomer, createInvoice, getInvoices } from '../../controllers/v1/zoho/zoho_controllers';
import axios from 'axios';

// Your Zoho credentials from the .env file
const {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URI,
  ZOHO_API_URL,
} = process.env;
const router: Router = Router();

router.get('/invoice', getInvoices);

router.post('/invoice', createInvoice);

router.post('/customer', addCustomer);


// Step 1: Redirect to Zoho's OAuth authorization endpoint
router.get('/oauth', (req, res) => {
  const authURL =`${ZOHO_API_URL}/auth?scope=ZohoBooks.fullaccess.all&client_id=${ZOHO_CLIENT_ID}&redirect_uri=${ZOHO_REDIRECT_URI}&response_type=code&access_type=offline&prompt=consent`;
  console.log(authURL,"authURL")
  res.redirect(authURL);
});

// Step 2: Handle the OAuth callback to get the authorization code
router.get('/oauth/callback', async (req, res) => {
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
router.get('/refresh-token', async (req, res) => {
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


export default router;
