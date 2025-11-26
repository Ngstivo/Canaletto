import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../utils/helpers';

const prisma = new PrismaClient();

// Validation schemas
const createCourseSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    price: z.number().min(0, 'Price must be 0 or greater'),
    discountPrice: z.number().min(0).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: z.string().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

// Get all courses with filtering
export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const {
            status,
            level,
            category,
            search,
            page = '1',
            limit = '10'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Only show published courses to non-instructors
        const userRole = (req as any).user?.role;
        if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
            where.status = 'PUBLISHED';
        } else if (status) {
            where.status = status;
        }

        if (level) where.level = level;
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    instructor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.course.count({ where }),
        ]);

        res.json({
            success: true,
            data: courses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Get single course by ID or slug
export const getCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const course = await prisma.course.findFirst({
            where: {
                OR: [
                    { id },
                    { slug: id },
                ],
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
                sections: {
                    include: {
                        lectures: {
                            orderBy: { sortOrder: 'asc' },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        res.json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Create new course (instructor only)
export const createCourse = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const validatedData = createCourseSchema.parse(req.body);

        // Generate unique slug
        const slug = await generateUniqueSlug(validatedData.title);

        const course = await prisma.course.create({
            data: {
                ...validatedData,
                slug,
                instructorId: userId,
                status: 'DRAFT',
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            data: course,
            message: 'Course created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        // Check if course exists and user is the instructor or admin
        const existingCourse = await prisma.course.findUnique({
            where: { id },
        });

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        if (existingCourse.instructorId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this course',
            });
        }

        const validatedData = updateCourseSchema.parse(req.body);

        // Update slug if title changed
        let updateData: any = { ...validatedData };
        if (validatedData.title && validatedData.title !== existingCourse.title) {
            updateData.slug = await generateUniqueSlug(validatedData.title);
        }

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            data: course,
            message: 'Course updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        if (course.instructorId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this course',
            });
        }

        await prisma.course.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Helper function to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);
    let counter = 1;

    while (await prisma.course.findUnique({ where: { slug } })) {
        slug = `${generateSlug(title)}-${counter}`;
        counter++;
    }

    return slug;
}
