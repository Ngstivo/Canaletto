import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
    generateResetToken,
    verifyResetToken,
    invalidateResetToken,
} from '../services/passwordResetService';

const prisma = new PrismaClient();

// Validation schemas
const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const validatedData = forgotPasswordSchema.parse(req.body);

        const token = await generateResetToken(validatedData.email);

        // Always return success to prevent email enumeration
        // In production, send email with reset link
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        console.log(`Password reset link: ${resetLink}`);
        // TODO: Send email with resetLink

        res.json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const validatedData = resetPasswordSchema.parse(req.body);

        const userId = verifyResetToken(validatedData.token);

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token',
            });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        // Update user password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        // Invalidate the token
        invalidateResetToken(validatedData.token);

        res.json({
            success: true,
            message: 'Password has been reset successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const validatedData = updateProfileSchema.parse(req.body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: validatedData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
            },
        });

        res.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
