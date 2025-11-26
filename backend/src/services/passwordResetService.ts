import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PasswordResetToken {
    userId: string;
    token: string;
    expiresAt: Date;
}

// In-memory store for password reset tokens
// In production, use Redis or database
const resetTokens = new Map<string, PasswordResetToken>();

/**
 * Generate a password reset token
 */
export const generateResetToken = async (email: string): Promise<string | null> => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return null;
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token
    resetTokens.set(token, {
        userId: user.id,
        token,
        expiresAt,
    });

    // Clean up expired tokens
    cleanupExpiredTokens();

    return token;
};

/**
 * Verify a password reset token
 */
export const verifyResetToken = (token: string): string | null => {
    const resetToken = resetTokens.get(token);

    if (!resetToken) {
        return null;
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
        resetTokens.delete(token);
        return null;
    }

    return resetToken.userId;
};

/**
 * Invalidate a password reset token
 */
export const invalidateResetToken = (token: string): void => {
    resetTokens.delete(token);
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = (): void => {
    const now = new Date();

    for (const [token, data] of resetTokens.entries()) {
        if (now > data.expiresAt) {
            resetTokens.delete(token);
        }
    }
};

// Clean up expired tokens every 10 minutes
setInterval(cleanupExpiredTokens, 10 * 60 * 1000);
