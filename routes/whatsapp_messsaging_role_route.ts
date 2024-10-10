import { Router } from 'express';
import { fetchTemplateStatus, sendWhatsappMessage, sendWhatsappMsg } from '../controllers/v1/whatsapp';
import { verifyToken, verifyTokenForApi } from '../middleware/auth';
import { fetchShopifyLenders, fetchShopifyOrder, sendUpdateOnPaymentToLender, sendPickupReminderToLender, sendUpdateOnPickupFromRenter, fetchShopifyProducts, sendFeedbackMessageToRenter, getOrderById, sendDeliveryReminderToRenter, sendReturnPickupReminderToRenter, createShopifyProduct } from '../controllers/v1/shopify';
import { getMessageTemplates } from '../controllers/v1/whatsapp';
import { getChatByUser, getWhatsappMessages } from '../controllers/v1/whatsappMessages';

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
router.get("/userMessages", verifyToken, getWhatsappMessages);
router.get("/getChatByUser/:id", verifyToken, getChatByUser);


router.post("/createShopifyProduct", createShopifyProduct);
router.post("/sendWhatsappMessage", sendWhatsappMessage)






export default router;