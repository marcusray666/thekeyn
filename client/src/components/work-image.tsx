import { useState } from 'react';
import { FileText, Music, Video, Image as ImageIcon, File } from 'lucide-react';

interface WorkImageProps {
  filename?: string;
  fileUrl?: string; // CDN URL for accessing the file
  mimeType: string;
  title: string;
  className?: string;
}

export function WorkImage({ filename, fileUrl, mimeType, title, className = "w-full h-48" }: WorkImageProps) {
  const [imageError, setImageError] = useState(false);

  const getFileTypeIcon = (mimeType: string) => {
    if (!mimeType) return <File className="h-12 w-12 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-12 w-12 text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-12 w-12 text-blue-400" />;
    if (mimeType.startsWith('video/')) return <Video className="h-12 w-12 text-emerald-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-12 w-12 text-red-400" />;
    return <File className="h-12 w-12 text-gray-400" />;
  };

  // Get the correct file URL (prefer fileUrl, fallback to filename)
  const getFileUrl = () => {
    if (fileUrl) return fileUrl; // Use CDN URL if available
    if (filename) return `/uploads/${filename}`; // Fallback to old path
    return null;
  };

  // Special handling for HEIC/HEIF files (not directly supported by browsers)
  if (mimeType && (mimeType === 'image/heic' || mimeType === 'image/heif') && (fileUrl || filename)) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border-2 border-dashed border-yellow-600`}>
        <ImageIcon className="h-12 w-12 text-yellow-400" />
        <p className="text-yellow-400 text-sm mt-2 text-center px-2">{title}</p>
        <p className="text-yellow-300 text-xs mt-1">HEIC Image (iPhone Photo)</p>
        <p className="text-gray-400 text-xs mt-1 text-center px-2">File uploaded successfully - preview not available</p>
      </div>
    );
  }

  // If it's an image and we have a file URL, try to display it
  if (mimeType && mimeType.startsWith('image/') && (fileUrl || filename) && !imageError) {
    return (
      <div className={`${className} relative overflow-hidden rounded-lg bg-gray-800/50 flex items-center justify-center`}>
        <img
          src={getFileUrl() || ''}
          alt={title}
          className="max-w-full max-h-full object-contain"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      </div>
    );
  }

  // If it's a video, display video player
  if (mimeType && mimeType.startsWith('video/') && (fileUrl || filename)) {
    return (
      <div className={`${className} relative overflow-hidden rounded-lg bg-gray-800/50 flex items-center justify-center`}>
        <video
          src={getFileUrl() || ''}
          className="max-w-full max-h-full object-contain"
          controls
          preload="metadata"
          style={{ backgroundColor: 'transparent' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // If it's audio, display audio player
  if (mimeType && mimeType.startsWith('audio/') && (fileUrl || filename)) {
    return (
      <div className={`${className} relative overflow-hidden rounded-lg bg-gray-800/50 flex flex-col items-center justify-center p-6`}>
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
          <Music className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-white text-sm font-medium mb-4 text-center">{title}</h3>
        <audio
          src={getFileUrl() || ''}
          className="w-full"
          controls
          preload="metadata"
        >
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  // Fallback to icon display
  return (
    <div className={`${className} flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600`}>
      {getFileTypeIcon(mimeType)}
      <p className="text-gray-400 text-sm mt-2 text-center px-2">{title}</p>
      <p className="text-gray-500 text-xs mt-1">{mimeType || 'Unknown type'}</p>
    </div>
  );
}