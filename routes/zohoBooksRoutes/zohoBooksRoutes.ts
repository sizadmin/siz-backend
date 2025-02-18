import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { addCustomer, createInvoice, getInvoices } from '../../controllers/v1/zoho/zoho_controllers';

const router: Router = Router();

router.get('/invoice',verifyToken, getInvoices);

router.post('/invoice',verifyToken, createInvoice);

router.post('/customer',verifyToken, addCustomer);

export default router;
