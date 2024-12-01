import { Router } from 'express';
import { addUser, deleteUser, getUsers, loginUser, updateUser } from '../controllers/v1/users';
import { addTemplates, deleteTemplate, getTemplates, getTemplatesById, SubmitTemplateForReview, updateTemplate, uploadImageToFB } from '../controllers/v1/wtemplate';
import { createTemplate } from '../controllers/v1/whatsapp';
// import { upload } from '../middleware/helperFuc';
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router: Router = Router();

router.get('/getall', getTemplates);

router.post('/', addTemplates);

router.put('/:id', updateTemplate);

router.delete('/:id', deleteTemplate);

router.get('/:id', getTemplatesById);
router.post('/submitReview', SubmitTemplateForReview);
router.post('/uploadImage',upload.single('file'), uploadImageToFB);







export default router;
