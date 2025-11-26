import { Router } from 'express';
import {
    getCourseSections,
    createSection,
    updateSection,
    deleteSection,
    createLecture,
    updateLecture,
    deleteLecture,
    reorderSections,
    reorderLectures,
} from '../controllers/contentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Section routes (all require authentication and instructor/admin role)
router.get('/courses/:courseId/sections', authenticate, getCourseSections);
router.post('/courses/:courseId/sections', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createSection);
router.put('/sections/:sectionId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), updateSection);
router.delete('/sections/:sectionId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), deleteSection);
router.post('/courses/:courseId/sections/reorder', authenticate, authorize('INSTRUCTOR', 'ADMIN'), reorderSections);

// Lecture routes
router.post('/sections/:sectionId/lectures', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createLecture);
router.put('/lectures/:lectureId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), updateLecture);
router.delete('/lectures/:lectureId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), deleteLecture);
router.post('/sections/:sectionId/lectures/reorder', authenticate, authorize('INSTRUCTOR', 'ADMIN'), reorderLectures);

export default router;
