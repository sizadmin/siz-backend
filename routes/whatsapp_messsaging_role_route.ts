import { Router } from 'express';
import { sendWhatsappMsg } from '../controllers/v1/whatsapp';
import { fetchShopifyLenders, fetchShopifyOrder, fetchShopifyProducts } from '../controllers/v1/shopify';

const router: Router = Router();

router.post('/msg', sendWhatsappMsg);

router.get('/fetchOrders', fetchShopifyOrder);
router.get('/fetchProducts', fetchShopifyProducts);
router.get('/fetchLenders', fetchShopifyLenders);




export default router;
