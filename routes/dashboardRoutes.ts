import { Router } from 'express';
import { getDashboardOrders } from '../controllers/v1/orders';
import { verifyToken } from '../middleware/auth';
const router: Router = Router();

router.get('/getorders',verifyToken, getDashboardOrders);




export default router;
