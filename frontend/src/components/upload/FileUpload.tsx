'use client';

import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploadProps {
  folder: 'thumbnails' | 'videos' | 'pdfs' | 'avatars';
  accept?: string;
  maxSize?: number;
  onUploadComplete: (fileUrl: string) => void;
  label?: string;
}

export default function FileUpload({
  folder,
  accept,
  maxSize = 100 * 1024 * 1024,
  onUploadComplete,
  label = 'Upload File',
}: FileUploadProps) {
  const { uploadFile, isUploading, progress, error } = useFileUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const fileUrl = await uploadFile(selectedFile, {
        folder,
        onProgress: (prog) => console.log(`Upload progress: ${prog}%`),
      });

      onUploadComplete(fileUrl);
      setSelectedFile(null);

      // Reset file input
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
          </p>
        )}
      </div>

      {selectedFile && !isUploading && (
        <button
          onClick={handleUpload}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Upload
        </button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
