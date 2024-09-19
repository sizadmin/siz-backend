import { Router } from 'express';
import { createPermission, getPermission } from '../controllers/v1/permission';
import { verifyAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', getPermission);
router.post('/',verifyAdmin, createPermission);

export default router;
