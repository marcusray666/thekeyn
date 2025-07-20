import { useState } from 'react';
import { FileText, Music, Video, Image as ImageIcon, File } from 'lucide-react';

interface WorkImageProps {
  filename?: string;
  mimeType: string;
  title: string;
  className?: string;
}

export function WorkImage({ filename, mimeType, title, className = "w-full h-48" }: WorkImageProps) {
  const [imageError, setImageError] = useState(false);

  const getFileTypeIcon = (mimeType: string) => {
    if (!mimeType) return <File className="h-12 w-12 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-12 w-12 text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-12 w-12 text-blue-400" />;
    if (mimeType.startsWith('video/')) return <Video className="h-12 w-12 text-emerald-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-12 w-12 text-red-400" />;
    return <File className="h-12 w-12 text-gray-400" />;
  };

  // If it's an image and we have a filename, try to display it
  if (mimeType && mimeType.startsWith('image/') && filename && !imageError) {
    return (
      <div className={`${className} relative overflow-hidden rounded-lg bg-gray-800/50 flex items-center justify-center`}>
        <img
          src={`/api/files/${filename}`}
          alt={title}
          className="max-w-full max-h-full object-contain"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
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