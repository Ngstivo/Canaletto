import { Request, Response } from 'express';
import { z } from 'zod';
import {
    generateUploadUrl,
    validateFileType,
    getAllowedTypes,
    getMaxFileSize,
} from '../services/s3Service';

// Validation schema
const uploadRequestSchema = z.object({
    fileName: z.string().min(1, 'File name is required'),
    contentType: z.string().min(1, 'Content type is required'),
    folder: z.enum(['thumbnails', 'videos', 'pdfs', 'avatars']),
});

/**
 * Generate pre-signed URL for file upload
 */
export const getUploadUrl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const validatedData = uploadRequestSchema.parse(req.body);
        const { fileName, contentType, folder } = validatedData;

        // Validate file type
        const allowedTypes = getAllowedTypes(folder);
        if (!validateFileType(contentType, allowedTypes)) {
            return res.status(400).json({
                success: false,
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            });
        }

        // Generate upload URL
        const uploadData = await generateUploadUrl({
            folder,
            fileName,
            contentType,
            maxSize: getMaxFileSize(folder),
        });

        res.json({
            success: true,
            data: uploadData,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        console.error('Get upload URL error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

/**
 * Confirm upload completion (optional endpoint for tracking)
 */
export const confirmUpload = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
        }

        const { key, fileUrl } = req.body;

        // Here you could:
        // - Verify the file exists in S3
        // - Update database with file URL
        // - Trigger video processing job
        // - Extract video metadata

        res.json({
            success: true,
            message: 'Upload confirmed',
            data: {
                key,
                fileUrl,
            },
        });
    } catch (error) {
        console.error('Confirm upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
