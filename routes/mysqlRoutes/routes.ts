import { Router } from 'express';
import { getOrdersSizApp, getProductSizApp, getProductSizAppById, getRecentOrdersSizApp, getUsersSizApp } from '../../controllers/v1/mysqlControllers/controller';
import { findLatestOrders, getAddressFromRenter, getPickupSlotsFromRenterForOrder, reconfirmOrderFromRenter, reminderToRenter, sendOrderTemplate, thanksFeedbackToRenter } from '../../controllers/v1/chatbot/deliveryBooking/deliveryBooking';
import { fetchProductsWebhook } from '../../controllers/v1/mysqlControllers/webhooks';
const router: Router = Router();

router.get('/users', getUsersSizApp);
router.get('/orders', getOrdersSizApp);
router.get('/recentOrders', getRecentOrdersSizApp);
router.get('/recentProducts', getProductSizApp);
router.get('/uploadProductById', getProductSizAppById);

router.get('/sendOrderConfirmation',findLatestOrders)
router.get('/sendOrderConfirmationTemplate',sendOrderTemplate)
router.get('/testAPI',getAddressFromRenter)

router.get('/reconfirmOrderFromRenter',reconfirmOrderFromRenter)
router.get('/thanksFeedbackToRenter',thanksFeedbackToRenter)


// router.get('/web_hook', fetchProductsWebhook);


export default router;
 