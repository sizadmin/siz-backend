import { Router } from 'express';
import { getDashboardData, getDashboardOrders } from '../controllers/v1/orders';
import { verifyToken } from '../middleware/auth';
const router: Router = Router();

router.get('/getorders',verifyToken, getDashboardOrders);
router.get('/getDashboardData',verifyToken, getDashboardData);




export default router;
