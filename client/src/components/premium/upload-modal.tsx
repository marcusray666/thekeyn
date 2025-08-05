import { useState, useRef } from "react";
import { X, Upload, FileText, Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setStep('processing');
      
      // Simulate processing
      setTimeout(() => {
        setStep('success');
      }, 2000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="story-modal">
      <div className="w-full max-w-lg bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            {step === 'upload' && 'Protect Your Work'}
            {step === 'processing' && 'Securing on Blockchain...'}
            {step === 'success' && 'Protected Successfully!'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div
              className={`upload-zone ${isDragging ? 'border-[#FE3F5E] bg-[#FE3F5E]/5' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drag & drop your file here
              </h3>
              <p className="text-white/50 mb-4">
                or click to browse files
              </p>
              <Button className="secondary-button">
                Choose File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
            />

            <div className="text-center text-white/50 text-sm">
              Supported: Images, Videos, Audio, Documents
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center animate-pulse">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Creating your certificate...
              </h3>
              <p className="text-white/50">
                Generating hash and anchoring to blockchain
              </p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Work Protected!
              </h3>
              <p className="text-white/50">
                Your digital asset is now secured on the blockchain
              </p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">File:</span>
                <span className="text-white font-medium">{selectedFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Certificate ID:</span>
                <span className="text-white font-mono text-sm">ABC123XYZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Blockchain:</span>
                <span className="text-white">Ethereum + Bitcoin</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button className="accent-button flex-1">
                <Download className="h-5 w-5 mr-2" />
                Download Certificate
              </Button>
              <Button className="glass-button flex-1">
                <Share2 className="h-5 w-5 mr-2" />
                Share Proof
              </Button>
            </div>

            <Button
              onClick={() => {
                handleClose();
                window.location.href = '/upload';
              }}
              className="w-full accent-button"
            >
              Upload Another Work
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}