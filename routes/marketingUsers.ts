import { Router } from 'express';
import { addMarketingUser, deleteMarketingUser, fetchContactsFromCSVFile, fetchMarketingUsers, getMarketingUsers, updateMarketingUser } from '../controllers/v1/marketingusers';
import multer from 'multer';
import { verifyToken } from '../middleware/auth';
const router: Router = Router();
const upload = multer({ dest: 'uploads/' }); // Store uploaded files in the 'uploads' folder

router.get('/',verifyToken, getMarketingUsers);
router.get('/sync_contacts', fetchMarketingUsers);


router.post('/',verifyToken, addMarketingUser);

router.put('/:id',verifyToken, updateMarketingUser);

router.delete('/:id', deleteMarketingUser);
router.post('/uploadCSV',upload.single('file'), fetchContactsFromCSVFile);






export default router;
