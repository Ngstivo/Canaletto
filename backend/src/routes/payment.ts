import { Router } from 'express';
import express from 'express';
import {
    createCheckoutSession,
    handleWebhook,
    getUserEnrollments,
    checkEnrollment,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Webhook route (must use raw body)
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    handleWebhook
);

// Protected routes
router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/enrollments', authenticate, getUserEnrollments);
router.get('/enrollment/:courseId', authenticate, checkEnrollment);

export default router;
