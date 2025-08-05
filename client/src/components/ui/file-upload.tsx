import { useState, useRef } from "react";
import { Upload, X, File, Image, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,audio/*,.pdf,.doc,.docx",
  multiple = false,
  maxSize = 500,
  className
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      return sizeMB <= maxSize;
    });

    if (validFiles.length !== fileArray.length) {
      alert(`Some files were too large. Maximum size is ${maxSize}MB.`);
    }

    setSelectedFiles(validFiles);
    
    // Create a new FileList-like object
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
    onFileSelect(dataTransfer.files);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    onFileSelect(dataTransfer.files);
  };

  const getFileIcon = (file: File) => {
    const imageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      'image/heic', 'image/heif', 'image/avif'
    ];
    
    if (imageTypes.includes(file.type) || file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type.startsWith('audio/')) return <Music size={20} />;
    return <File size={20} />;
  };

  const getFileTypeDisplay = (file: File) => {
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      return 'HEIC Image (iPhone Photo)';
    }
    return file.type || 'Unknown type';
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "upload-zone rounded-2xl p-8 cursor-pointer transition-all duration-300 text-center",
          dragActive && "border-purple-400 bg-opacity-20"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
        />
        
        <Upload className="mx-auto mb-4 text-purple-400" size={48} />
        <h3 className="text-2xl font-semibold mb-2 gradient-text">
          Upload Your Work
        </h3>
        <p className="text-gray-400 mb-4">
          Drag & drop or click to select files
        </p>
        <p className="text-sm text-gray-500">
          Supports images (including HEIC), documents, audio files (max {maxSize}MB)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="glass-morphism rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="text-purple-400">
                  {getFileIcon(file)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {getFileTypeDisplay(file)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
