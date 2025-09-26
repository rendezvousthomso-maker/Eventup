'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload Your Avatar</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          // Validate file type
          if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
          }

          // Validate file size (max 4.5MB for Vercel Blob)
          if (file.size > 4.5 * 1024 * 1024) {
            alert('Image size must be less than 4.5MB');
            return;
          }

          setUploading(true);
          try {
            const response = await fetch(
              `/api/avatar/upload?filename=${file.name}`,
              {
                method: 'POST',
                body: file,
              },
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Upload failed');
            }

            const newBlob = (await response.json()) as PutBlobResult;
            setBlob(newBlob);
          } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setUploading(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input 
            name="file" 
            ref={inputFileRef} 
            type="file" 
            accept="image/jpeg, image/png, image/webp, image/gif" 
            required 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {blob && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-sm font-medium text-green-800 mb-2">Upload Successful!</h3>
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              <strong>URL:</strong> 
              <a 
                href={blob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline"
              >
                {blob.url}
              </a>
            </p>
            <p className="text-sm text-green-700">
              <strong>Size:</strong> {Math.round(blob.size / 1024)} KB
            </p>
            <p className="text-sm text-green-700">
              <strong>Uploaded:</strong> {new Date(blob.uploadedAt).toLocaleString()}
            </p>
          </div>
          
          {blob.url && (
            <div className="mt-4">
              <img 
                src={blob.url} 
                alt="Uploaded avatar" 
                className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-green-200"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

