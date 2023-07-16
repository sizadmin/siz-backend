import { Router } from 'express';
import { getDashboardOrders } from '../controllers/v1/orders';
const router: Router = Router();

router.get('/getorders', getDashboardOrders);




export default router;
