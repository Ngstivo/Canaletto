import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

// Validation schemas
const saveProgressSchema = z.object({
    lectureId: z.string(),
    currentTime: z.number().min(0),
    completed: z.boolean().optional(),
});

/**
 * Save or update lecture progress
 */
export const saveProgress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const validatedData = saveProgressSchema.parse(req.body);
        const { lectureId, currentTime, completed = false } = validatedData;

        // Verify lecture exists
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: { section: { include: { course: true } } },
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                error: 'Lecture not found',
            });
        }

        // Verify user is enrolled
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lecture.section.courseId,
                },
            },
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                error: 'Not enrolled in this course',
            });
        }

        // Upsert progress
        const progress = await prisma.progress.upsert({
            where: {
                userId_lectureId: {
                    userId,
                    lectureId,
                },
            },
            update: {
                currentTime,
                completed,
                lastWatched: new Date(),
            },
            create: {
                userId,
                lectureId,
                currentTime,
                completed,
            },
        });

        res.json({
            success: true,
            data: progress,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Save progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

/**
 * Mark lecture as complete
 */
export const markComplete = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { lectureId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        // Verify lecture and enrollment
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: { section: true },
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                error: 'Lecture not found',
            });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lecture.section.courseId,
                },
            },
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                error: 'Not enrolled in this course',
            });
        }

        // Mark as complete
        const progress = await prisma.progress.upsert({
            where: {
                userId_lectureId: {
                    userId,
                    lectureId,
                },
            },
            update: {
                completed: true,
                completedAt: new Date(),
            },
            create: {
                userId,
                lectureId,
                completed: true,
                completedAt: new Date(),
            },
        });

        res.json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error('Mark complete error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

/**
 * Get course progress for a user
 */
export const getCourseProgress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { courseId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        // Get all lectures in the course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lectures: {
                            include: {
                                progress: {
                                    where: { userId },
                                },
                            },
                        },
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

        // Calculate progress
        const allLectures = course.sections.flatMap((s) => s.lectures);
        const totalLectures = allLectures.length;
        const completedLectures = allLectures.filter(
            (l) => l.progress[0]?.completed
        ).length;

        const progressPercentage =
            totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        res.json({
            success: true,
            data: {
                courseId,
                totalLectures,
                completedLectures,
                progressPercentage,
                sections: course.sections.map((section) => ({
                    id: section.id,
                    title: section.title,
                    lectures: section.lectures.map((lecture) => ({
                        id: lecture.id,
                        title: lecture.title,
                        completed: lecture.progress[0]?.completed || false,
                        currentTime: lecture.progress[0]?.currentTime || 0,
                        lastWatched: lecture.progress[0]?.lastWatched,
                    })),
                })),
            },
        });
    } catch (error) {
        console.error('Get course progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

/**
 * Get user's continue watching (recently watched lectures)
 */
export const getContinueWatching = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        // Get recent progress (not completed, ordered by last watched)
        const recentProgress = await prisma.progress.findMany({
            where: {
                userId,
                completed: false,
            },
            include: {
                lecture: {
                    include: {
                        section: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lastWatched: 'desc',
            },
            take: 5,
        });

        res.json({
            success: true,
            data: recentProgress.map((p) => ({
                lectureId: p.lectureId,
                lectureTitle: p.lecture.title,
                currentTime: p.currentTime,
                lastWatched: p.lastWatched,
                course: {
                    id: p.lecture.section.course.id,
                    title: p.lecture.section.course.title,
                    slug: p.lecture.section.course.slug,
                    thumbnailUrl: p.lecture.section.course.thumbnailUrl,
                },
            })),
        });
    } catch (error) {
        console.error('Get continue watching error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
