import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { addCustomer, createInvoice, getCustomer, getInvoices, oauth, oauthCallback, oauthRefreshToken } from '../../controllers/v1/zoho/zoho_controllers';
import axios from 'axios';

const router: Router = Router();

router.get('/invoice', getInvoices);

router.post('/invoice', createInvoice);

router.post('/customer', addCustomer);

router.get('/customer', getCustomer);   
router.get('/oauth', oauth);   
router.get('/oauth', oauthCallback);   
router.get('/refresh-token', oauthRefreshToken);   


export default router;
