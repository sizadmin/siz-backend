import { Router } from 'express';
import { getDashboardOrders, getOrderDeliveryStatus,newOrderStatus, updateOrderStatus } from '../controllers/v1/orders';
const router: Router = Router();

router.get('/:id', getOrderDeliveryStatus);
router.post('/:id',newOrderStatus );
router.put('/:id',updateOrderStatus );




export default router;
