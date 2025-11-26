import { Router } from 'express';
import { getUploadUrl, confirmUpload } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All upload routes require authentication
router.post('/get-upload-url', authenticate, getUploadUrl);
router.post('/confirm-upload', authenticate, confirmUpload);

export default router;
