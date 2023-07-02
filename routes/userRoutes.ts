import { Router } from 'express';
import { addUser, deleteUser, getUsers, loginUser, updateUser } from '../controllers/v1/users';

const router: Router = Router();

router.get('/users', getUsers);

router.post('/user', addUser);

router.put('/user/:id', updateUser);

router.delete('/user/:id', deleteUser);

router.post('/login', loginUser);

export default router;
