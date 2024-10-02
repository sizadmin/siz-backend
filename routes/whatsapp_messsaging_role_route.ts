import { Router } from 'express';
import { fetchTemplateStatus, sendWhatsappMsg } from '../controllers/v1/whatsapp';
import { verifyToken, verifyTokenForApi } from '../middleware/auth';
import { fetchShopifyLenders, fetchShopifyOrder, sendUpdateOnPaymentToLender, sendPickupReminderToLender, sendUpdateOnPickupFromRenter, fetchShopifyProducts, sendFeedbackMessageToRenter, getOrderById, sendDeliveryReminderToRenter, sendReturnPickupReminderToRenter, createShopifyProduct } from '../controllers/v1/shopify';
import { getMessageTemplates } from '../controllers/v1/whatsapp';
import { getWhatsappMessages } from '../controllers/v1/whatsappMessages';
const router: Router = Router();

router.post('/msg', sendWhatsappMsg);

router.get('/fetchOrders', fetchShopifyOrder);
router.get('/fetchProducts', fetchShopifyProducts);
router.get('/fetchLenders', fetchShopifyLenders);
router.get('/sendDeliveryReminder', sendDeliveryReminderToRenter);
router.get('/sendReturnPickupReminder', sendReturnPickupReminderToRenter);
router.get('/sendFeedbackToRenter', sendFeedbackMessageToRenter);
router.get('/sendPickupReminderToLender/:date/:timeslot', sendPickupReminderToLender);
router.get('/sendUpdateOnPickupFromRenter', sendUpdateOnPickupFromRenter);
router.get('/updateToLenderAboutPayment/:id', sendUpdateOnPaymentToLender);
router.get('/getMessageTemplates', verifyTokenForApi, getMessageTemplates);
router.get('/order/:id', getOrderById);
router.get('/fetchWTemplateStatus', verifyTokenForApi, fetchTemplateStatus);
router.get("/userMessages", verifyToken, getWhatsappMessages)
router.post("/createShopifyProduct", createShopifyProduct)





export default router;