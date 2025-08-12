import { z } from "zod";

// Community post validation
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  location: z.string().max(100, "Location too long").optional(),
  objectPath: z.string().optional(), // Object storage path after upload
  isProtected: z.string().transform(val => val === "true").optional(),
  protectedWorkId: z.number().optional(),
});

// File type validation
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif"
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime"
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"
]);

export const isAllowedImageType = (mimeType?: string): boolean => 
  !!mimeType && ALLOWED_IMAGE_TYPES.has(mimeType);

export const isAllowedVideoType = (mimeType?: string): boolean => 
  !!mimeType && ALLOWED_VIDEO_TYPES.has(mimeType);

export const isAllowedAudioType = (mimeType?: string): boolean => 
  !!mimeType && ALLOWED_AUDIO_TYPES.has(mimeType);

export const isAllowedMediaType = (mimeType?: string): boolean => 
  isAllowedImageType(mimeType) || isAllowedVideoType(mimeType) || isAllowedAudioType(mimeType);

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB  
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

export const getMaxFileSize = (mimeType?: string): number => {
  if (isAllowedImageType(mimeType)) return MAX_IMAGE_SIZE;
  if (isAllowedVideoType(mimeType)) return MAX_VIDEO_SIZE;
  if (isAllowedAudioType(mimeType)) return MAX_AUDIO_SIZE;
  return MAX_IMAGE_SIZE; // Default to image size
};

// Upload URL request validation
export const uploadUrlSchema = z.object({
  contentType: z.string().refine(isAllowedMediaType, "Invalid file type"),
  fileSize: z.number().positive().max(MAX_VIDEO_SIZE, "File too large"),
});

// Work upload validation
export const workUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  creatorName: z.string().min(1, "Creator name is required").max(100, "Creator name too long"),
  collaborators: z.array(z.string()).max(10, "Too many collaborators").optional(),
});

// API Error type
export type ApiError = { 
  error: string; 
  code?: string; 
  details?: unknown;
};

export const createApiError = (error: string, code?: string, details?: unknown): ApiError => ({
  error,
  code,
  details
});