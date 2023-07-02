import { Router } from 'express';
import { createRole, getRoles } from '../controllers/v1/role';
const router: Router = Router();

router.get('/roles', getRoles);
router.post('/roles', createRole);

export default router;
