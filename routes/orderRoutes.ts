import { Router } from 'express';
import { getDashboardOrders, getOrderDeliveryStatus,updateOrderStatusChanges,newOrderStatus, updateOrderStatus } from '../controllers/v1/orders';
const router: Router = Router();

router.get('/:id', getOrderDeliveryStatus);
router.post('/:id',newOrderStatus );
router.put('/:id',updateOrderStatus );
router.post('/updateOrderStatus/:id',updateOrderStatusChanges );



export default router;
