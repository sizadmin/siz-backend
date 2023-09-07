import { Router } from 'express';
import { sendWhatsappMsg } from '../controllers/v1/whatsapp';
import { fetchShopifyLenders, fetchShopifyOrder,sendPickupReminderToLender,sendUpdateOnPickupFromRenter, fetchShopifyProducts,sendFeedbackMessageToRenter, getOrderById,sendDeliveryReminderToRenter,sendReturnPickupReminderToRenter } from '../controllers/v1/shopify';

const router: Router = Router();

router.post('/msg', sendWhatsappMsg);

router.get('/fetchOrders', fetchShopifyOrder);
router.get('/fetchProducts', fetchShopifyProducts);
router.get('/fetchLenders', fetchShopifyLenders);
router.get('/sendDeliveryReminder', sendDeliveryReminderToRenter);
router.get('/sendReturnPickupReminder', sendReturnPickupReminderToRenter);
router.get('/sendFeedbackToRenter', sendFeedbackMessageToRenter);
router.get('/sendPickupReminderToLender/:date/:timeslot', sendPickupReminderToLender);
router.get('/sendUpdateOnPickupFromRenter/:id', sendUpdateOnPickupFromRenter);
router.get('/order/:id', getOrderById);




export default router;
