import { Router } from 'express';
import {
    saveProgress,
    markComplete,
    getCourseProgress,
    getContinueWatching,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.post('/save', authenticate, saveProgress);
router.patch('/lectures/:lectureId/complete', authenticate, markComplete);
router.get('/courses/:courseId', authenticate, getCourseProgress);
router.get('/continue-watching', authenticate, getContinueWatching);

export default router;
