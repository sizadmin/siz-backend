import { Router } from 'express';
import { fetchShopifyOrderUsingWebhook } from '../controllers/v1/webhooks';

const router: Router = Router();


router.post('/webhooks/orders/create', fetchShopifyOrderUsingWebhook);



export default router;
