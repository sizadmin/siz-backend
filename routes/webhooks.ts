import { Router } from 'express';
import { fetchShopifyOrderUsingWebhook ,listenRepliesFromWebhook,verifyTokenWhatsapp} from '../controllers/v1/webhooks';

const router: Router = Router();


router.post('/webhooks/orders/create', fetchShopifyOrderUsingWebhook);
router.post('/webhooks/verify/whatsapp', listenRepliesFromWebhook);
router.get('/webhooks/verify/whatsapp', verifyTokenWhatsapp);



export default router;
