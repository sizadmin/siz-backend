import { Router } from 'express';
import { getLendersInfo } from '../controllers/v1/lender';
const router: Router = Router();

router.get('/', getLendersInfo);

export default router;
