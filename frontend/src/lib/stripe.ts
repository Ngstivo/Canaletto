'use client';

import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export async function enrollInCourse(courseId: string): Promise<void> {
    try {
        const token = await fetch('/api/auth/session').then(res => res.json());

        // Create checkout session
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-checkout-session`,
            { courseId },
            {
                headers: {
                    Authorization: `Bearer ${token.user?.token || ''}`,
                },
            }
        );

        if (response.data.success) {
            const stripe = await stripePromise;

            if (!stripe) {
                throw new Error('Stripe failed to load');
            }

            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.data.sessionId,
            });

            if (error) {
                throw error;
            }
        }
    } catch (error: any) {
        console.error('Enrollment error:', error);
        throw new Error(error.response?.data?.error || 'Failed to start checkout');
    }
}

export async function checkEnrollment(courseId: string): Promise<boolean> {
    try {
        const token = await fetch('/api/auth/session').then(res => res.json());

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payment/enrollment/${courseId}`,
            {
                headers: {
                    Authorization: `Bearer ${token.user?.token || ''}`,
                },
            }
        );

        return response.data.data.enrolled;
    } catch (error) {
        console.error('Check enrollment error:', error);
        return false;
    }
}

export async function getUserEnrollments() {
    try {
        const token = await fetch('/api/auth/session').then(res => res.json());

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payment/enrollments`,
            {
                headers: {
                    Authorization: `Bearer ${token.user?.token || ''}`,
                },
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Get enrollments error:', error);
        return [];
    }
}
