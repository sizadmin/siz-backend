import { Router } from 'express';
import { addCampaign, deleteCampaign, getCampaign, updateCampaign } from '../controllers/v1/campaigns';
import { verifyToken } from '../middleware/auth';

const router: Router = Router();

router.get('/',verifyToken, getCampaign);

router.post('/',verifyToken, addCampaign);

router.put('/:id',verifyToken, updateCampaign);

router.delete('/:id', deleteCampaign);


export default router;
