'use client';

import { useState } from 'react';
import axios from 'axios';

interface UploadOptions {
    folder: 'thumbnails' | 'videos' | 'pdfs' | 'avatars';
    onProgress?: (progress: number) => void;
    onSuccess?: (fileUrl: string) => void;
    onError?: (error: string) => void;
}

export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string>('');

    const uploadFile = async (file: File, options: UploadOptions) => {
        const { folder, onProgress, onSuccess, onError } = options;

        setIsUploading(true);
        setProgress(0);
        setError('');

        try {
            // Get auth token
            const session = await fetch('/api/auth/session').then(res => res.json());

            // Step 1: Get pre-signed URL
            const urlResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/get-upload-url`,
                {
                    fileName: file.name,
                    contentType: file.type,
                    folder,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.user?.token || ''}`,
                    },
                }
            );

            if (!urlResponse.data.success) {
                throw new Error(urlResponse.data.error || 'Failed to get upload URL');
            }

            const { uploadUrl, fileUrl, key } = urlResponse.data.data;

            // Step 2: Upload file directly to S3
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || file.size)
                    );
                    setProgress(percentCompleted);
                    onProgress?.(percentCompleted);
                },
            });

            // Step 3: Confirm upload (optional)
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/confirm-upload`,
                {
                    key,
                    fileUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.user?.token || ''}`,
                    },
                }
            );

            setIsUploading(false);
            setProgress(100);
            onSuccess?.(fileUrl);

            return fileUrl;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
            setError(errorMessage);
            setIsUploading(false);
            onError?.(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        uploadFile,
        isUploading,
        progress,
        error,
    };
}
