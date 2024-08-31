import { Router } from 'express';
import { addUser, deleteUser, forgotPassword, getUserById, getUsers, loginUser, updateUser } from '../controllers/v1/users';

const router: Router = Router();

router.get('/users', getUsers);

router.post('/user', addUser);

router.put('/user/:id', updateUser);

router.delete('/user/:id', deleteUser);

router.post('/login', loginUser);
router.post('/forgotPassword', forgotPassword);

router.get('/user/:id', getUserById);




export default router;
