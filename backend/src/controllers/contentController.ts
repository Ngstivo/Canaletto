import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createSectionSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    sortOrder: z.number().int().min(0).optional(),
});

const updateSectionSchema = createSectionSchema.partial();

const createLectureSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    contentType: z.enum(['VIDEO', 'PDF', 'TEXT', 'QUIZ']),
    contentUrl: z.string().optional(),
    textContent: z.string().optional(),
    videoDuration: z.number().int().min(0).optional(),
    isFree: z.boolean().optional().default(false),
    sortOrder: z.number().int().min(0).optional(),
});

const updateLectureSchema = createLectureSchema.partial();

// Get course sections
export const getCourseSections = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        const sections = await prisma.courseSection.findMany({
            where: { courseId },
            include: {
                lectures: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        res.json({
            success: true,
            data: sections,
        });
    } catch (error) {
        console.error('Get sections error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Create section
export const createSection = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = (req as any).user?.id;

        // Check course ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        if (course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        const validatedData = createSectionSchema.parse(req.body);

        // Get highest sort order if not provided
        if (validatedData.sortOrder === undefined) {
            const lastSection = await prisma.courseSection.findFirst({
                where: { courseId },
                orderBy: { sortOrder: 'desc' },
            });
            validatedData.sortOrder = (lastSection?.sortOrder || 0) + 1;
        }

        const section = await prisma.courseSection.create({
            data: {
                ...validatedData,
                courseId,
            },
            include: {
                lectures: true,
            },
        });

        res.status(201).json({
            success: true,
            data: section,
            message: 'Section created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Create section error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Update section
export const updateSection = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const userId = (req as any).user?.id;

        const section = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found',
            });
        }

        if (section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        const validatedData = updateSectionSchema.parse(req.body);

        const updatedSection = await prisma.courseSection.update({
            where: { id: sectionId },
            data: validatedData,
            include: {
                lectures: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        res.json({
            success: true,
            data: updatedSection,
            message: 'Section updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Delete section
export const deleteSection = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const userId = (req as any).user?.id;

        const section = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found',
            });
        }

        if (section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        await prisma.courseSection.delete({
            where: { id: sectionId },
        });

        res.json({
            success: true,
            message: 'Section deleted successfully',
        });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Create lecture
export const createLecture = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const userId = (req as any).user?.id;

        const section = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found',
            });
        }

        if (section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        const validatedData = createLectureSchema.parse(req.body);

        // Get highest sort order if not provided
        if (validatedData.sortOrder === undefined) {
            const lastLecture = await prisma.lecture.findFirst({
                where: { sectionId },
                orderBy: { sortOrder: 'desc' },
            });
            validatedData.sortOrder = (lastLecture?.sortOrder || 0) + 1;
        }

        const lecture = await prisma.lecture.create({
            data: {
                ...validatedData,
                sectionId,
            },
        });

        res.status(201).json({
            success: true,
            data: lecture,
            message: 'Lecture created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Create lecture error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Update lecture
export const updateLecture = async (req: Request, res: Response) => {
    try {
        const { lectureId } = req.params;
        const userId = (req as any).user?.id;

        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: {
                section: {
                    include: { course: true },
                },
            },
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                error: 'Lecture not found',
            });
        }

        if (lecture.section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        const validatedData = updateLectureSchema.parse(req.body);

        const updatedLecture = await prisma.lecture.update({
            where: { id: lectureId },
            data: validatedData,
        });

        res.json({
            success: true,
            data: updatedLecture,
            message: 'Lecture updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Update lecture error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Delete lecture
export const deleteLecture = async (req: Request, res: Response) => {
    try {
        const { lectureId } = req.params;
        const userId = (req as any).user?.id;

        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: {
                section: {
                    include: { course: true },
                },
            },
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                error: 'Lecture not found',
            });
        }

        if (lecture.section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        await prisma.lecture.delete({
            where: { id: lectureId },
        });

        res.json({
            success: true,
            message: 'Lecture deleted successfully',
        });
    } catch (error) {
        console.error('Delete lecture error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Reorder sections
export const reorderSections = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = (req as any).user?.id;
        const { sectionIds } = req.body; // Array of section IDs in new order

        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found',
            });
        }

        if (course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        // Update sort orders
        await Promise.all(
            sectionIds.map((id: string, index: number) =>
                prisma.courseSection.update({
                    where: { id },
                    data: { sortOrder: index },
                })
            )
        );

        res.json({
            success: true,
            message: 'Sections reordered successfully',
        });
    } catch (error) {
        console.error('Reorder sections error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Reorder lectures
export const reorderLectures = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const userId = (req as any).user?.id;
        const { lectureIds } = req.body; // Array of lecture IDs in new order

        const section = await prisma.courseSection.findUnique({
            where: { id: sectionId },
            include: { course: true },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found',
            });
        }

        if (section.course.instructorId !== userId && (req as any).user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        // Update sort orders
        await Promise.all(
            lectureIds.map((id: string, index: number) =>
                prisma.lecture.update({
                    where: { id },
                    data: { sortOrder: index },
                })
            )
        );

        res.json({
            success: true,
            message: 'Lectures reordered successfully',
        });
    } catch (error) {
        console.error('Reorder lectures error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
