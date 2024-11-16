import { Router } from 'express';
import { getOrdersSizApp, getProductSizApp, getProductSizAppById, getRecentOrdersSizApp, getUsersSizApp } from '../../controllers/v1/mysqlControllers/controller';
import { findLatestOrders, sendOrderTemplate } from '../../controllers/v1/chatbot/deliveryBooking/deliveryBooking';
const router: Router = Router();

router.get('/users', getUsersSizApp);
router.get('/orders', getOrdersSizApp);
router.get('/recentOrders', getRecentOrdersSizApp);
router.get('/recentProducts', getProductSizApp);
router.get('/uploadProductById', getProductSizAppById);

router.get('/sendOrderConfirmation',findLatestOrders)
router.get('/sendOrderConfirmationTemplate',sendOrderTemplate)




export default router;
