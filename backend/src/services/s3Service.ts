import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';
const CDN_URL = process.env.AWS_CLOUDFRONT_URL || '';

export interface UploadConfig {
    folder: 'thumbnails' | 'videos' | 'pdfs' | 'avatars';
    fileName: string;
    contentType: string;
    maxSize?: number; // in bytes
}

/**
 * Generate a pre-signed URL for uploading to S3
 */
export async function generateUploadUrl(config: UploadConfig): Promise<{
    uploadUrl: string;
    fileUrl: string;
    key: string;
}> {
    const { folder, fileName, contentType, maxSize = 100 * 1024 * 1024 } = config;

    // Generate unique key
    const randomId = crypto.randomBytes(16).toString('hex');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${randomId}-${sanitizedFileName}`;

    // Create command for pre-signed URL
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    // Generate pre-signed URL (expires in 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Generate public file URL (via CDN if configured)
    const fileUrl = CDN_URL
        ? `${CDN_URL}/${key}`
        : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        uploadUrl,
        fileUrl,
        key,
    };
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

/**
 * Validate file type for uploads
 */
export function validateFileType(
    contentType: string,
    allowedTypes: string[]
): boolean {
    return allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
            const prefix = type.slice(0, -2);
            return contentType.startsWith(prefix);
        }
        return contentType === type;
    });
}

/**
 * Get allowed file types for different upload categories
 */
export function getAllowedTypes(folder: UploadConfig['folder']): string[] {
    const typeMap = {
        thumbnails: ['image/jpeg', 'image/png', 'image/webp'],
        videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
        pdfs: ['application/pdf'],
        avatars: ['image/jpeg', 'image/png', 'image/webp'],
    };

    return typeMap[folder] || [];
}

/**
 * Get max file size for different upload categories
 */
export function getMaxFileSize(folder: UploadConfig['folder']): number {
    const sizeMap = {
        thumbnails: 5 * 1024 * 1024, // 5MB
        videos: 500 * 1024 * 1024, // 500MB
        pdfs: 10 * 1024 * 1024, // 10MB
        avatars: 2 * 1024 * 1024, // 2MB
    };

    return sizeMap[folder] || 10 * 1024 * 1024;
}
