import { Router } from 'express';
import {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourse);

// Instructor/Admin routes
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);

export default router;
