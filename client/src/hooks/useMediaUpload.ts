import { useState, useCallback } from 'react';
import { mediaAPI } from '../services/api';

interface UploadState {
  loading: boolean;
  progress: number;
  error: string | null;
  mediaUrl: string | null;
}

/**
 * Custom hook for handling media uploads to AWS S3
 */
export const useMediaUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    progress: 0,
    error: null,
    mediaUrl: null,
  });

  /**
   * Upload a file to AWS S3
   * @param file The file to upload
   * @param onProgress Optional progress callback
   */
  const uploadMedia = useCallback(
    async (file: File, onProgress?: (progress: number) => void): Promise<string | null> => {
      setUploadState({
        loading: true,
        progress: 0,
        error: null,
        mediaUrl: null,
      });

      try {
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);

        // Make the upload request
        const response = await mediaAPI.uploadMedia(formData);
        
        // Update state with the media URL from the response
        const mediaUrl = response.data.url;
        setUploadState({
          loading: false,
          progress: 100,
          error: null,
          mediaUrl,
        });
        
        return mediaUrl;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to upload media';
        setUploadState({
          loading: false,
          progress: 0,
          error: errorMsg,
          mediaUrl: null,
        });
        return null;
      }
    },
    []
  );

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploadState({
      loading: false,
      progress: 0,
      error: null,
      mediaUrl: null,
    });
  }, []);

  return {
    ...uploadState,
    uploadMedia,
    resetUpload,
  };
}; 