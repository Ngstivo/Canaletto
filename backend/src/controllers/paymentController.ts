import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
});

// Create checkout session for course enrollment
export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        // Get course details
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        if (course.status !== 'PUBLISHED') {
            return res.status(400).json({
                success: false,
                error: 'Course is not published',
            });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                error: 'Already enrolled in this course',
            });
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        let customerId = user?.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user?.email,
                metadata: {
                    userId: userId,
                },
            });

            customerId = customer.id;

            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }

        // Determine price (use discount if available)
        const price = course.discountPrice || course.price;

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.title,
                            description: course.shortDescription || undefined,
                            images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
                        },
                        unit_amount: Math.round(Number(price) * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/courses/${course.slug}?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}?canceled=true`,
            metadata: {
                courseId: course.id,
                userId: userId,
            },
        });

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Handle Stripe webhook events
export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        return res.status(400).send('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('PaymentIntent succeeded:', paymentIntent.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('PaymentIntent failed:', paymentIntent.id);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

// Handle successful checkout
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const { courseId, userId } = session.metadata || {};

    if (!courseId || !userId) {
        console.error('Missing metadata in checkout session');
        return;
    }

    try {
        // Check if enrollment already exists (idempotency)
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            console.log('Enrollment already exists, skipping');
            return;
        }

        // Create enrollment
        await prisma.enrollment.create({
            data: {
                userId,
                courseId,
                paymentIntentId: session.payment_intent as string,
                amountPaid: session.amount_total ? session.amount_total / 100 : 0,
            },
        });

        // Update course enrollment count
        await prisma.course.update({
            where: { id: courseId },
            data: {
                enrollmentCount: {
                    increment: 1,
                },
            },
        });

        console.log(`Enrollment created for user ${userId} in course ${courseId}`);
    } catch (error) {
        console.error('Error creating enrollment:', error);
        throw error;
    }
}

// Get user's enrollments
export const getUserEnrollments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });

        res.json({
            success: true,
            data: enrollments,
        });
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Check if user is enrolled in a course
export const checkEnrollment = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        res.json({
            success: true,
            data: {
                enrolled: !!enrollment,
                enrolledAt: enrollment?.enrolledAt,
            },
        });
    } catch (error) {
        console.error('Check enrollment error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
