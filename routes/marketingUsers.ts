import { Router } from 'express';
import { addMarketingUser, deleteMarketingUser, fetchMarketingUsers, getMarketingUsers, updateMarketingUser } from '../controllers/v1/marketingusers';

const router: Router = Router();

router.get('/', getMarketingUsers);
router.get('/sync_contacts', fetchMarketingUsers);


router.post('/', addMarketingUser);

router.put('/:id', updateMarketingUser);

router.delete('/:id', deleteMarketingUser);




export default router;
