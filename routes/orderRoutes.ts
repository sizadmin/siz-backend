import { Router } from 'express';
import { getOrderDeliveryStatus,newOrderStatus, updateOrderStatus } from '../controllers/v1/orders';
const router: Router = Router();

router.get('/order-status/:id', getOrderDeliveryStatus);
router.post('/order-status/:id',newOrderStatus );
router.put('/order-status/:id',updateOrderStatus );


export default router;
