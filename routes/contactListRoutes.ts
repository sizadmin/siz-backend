import { Router } from 'express';
import { addContactList, deleteContactList, getContactList, updateContactList } from '../controllers/v1/contactlists';
import { verifyToken } from '../middleware/auth';

const router: Router = Router();

router.get('/',verifyToken, getContactList);

router.post('/',verifyToken, addContactList);

router.put('/:id',verifyToken, updateContactList);

router.delete('/:id',verifyToken, deleteContactList);


export default router;
