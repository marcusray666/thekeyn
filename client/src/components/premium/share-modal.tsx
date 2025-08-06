import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy, 
  Share2, 
  Twitter, 
  Facebook, 
  MessageCircle, 
  Mail, 
  Link2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: number;
    title: string;
    type: 'post' | 'work';
    creatorName: string;
    creatorId: number;
    thumbnailUrl?: string;
    isProtected?: boolean;
    filename?: string;
    description?: string;
  };
}

export function ShareModal({ isOpen, onClose, content }: ShareModalProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [includePreview, setIncludePreview] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/${content.type === 'work' ? 'certificates' : 'posts'}/${content.id}`;
  const previewText = `Check out "${content.title}" by ${content.creatorName} on Loggin'`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const message = customMessage || previewText;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = "";

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent(content.title)}&summary=${encodedMessage}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(content.title)}&body=${encodedMessage}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const shareToMessages = async () => {
    setIsSharing(true);
    try {
      // This would integrate with the messaging system
      // For now, navigate to messages with pre-filled content
      const shareData = {
        type: 'content_share',
        contentId: content.id,
        contentType: content.type,
        message: customMessage || previewText,
        url: shareUrl
      };
      
      // Store in session for messages page to pick up
      sessionStorage.setItem('pendingShare', JSON.stringify(shareData));
      window.location.href = '/messages';
    } catch (error) {
      console.error('Error sharing to messages:', error);
      toast({
        title: "Sharing failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const generateSmartPreview = () => {
    if (!includePreview) return customMessage || previewText;

    return `${customMessage || previewText}

📋 ${content.title}
👤 by ${content.creatorName}
${content.isProtected ? '🛡️ Blockchain Protected' : ''}
${content.description ? `\n"${content.description.substring(0, 100)}${content.description.length > 100 ? '...' : ''}"\n` : ''}
🔗 ${shareUrl}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-[#FE3F5E]" />
            <span>Share Content</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                {content.thumbnailUrl ? (
                  <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <div className="text-lg">
                    {content.type === 'work' ? '📄' : '💬'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{content.title}</h3>
                  {content.isProtected && (
                    <Shield className="h-4 w-4 text-[#FE3F5E]" />
                  )}
                </div>
                <p className="text-sm text-white/70">by {content.creatorName}</p>
                {content.description && (
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{content.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Custom Message (Optional)</label>
            <Textarea
              placeholder="Add your own message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/50 resize-none"
              rows={3}
            />
          </div>

          {/* Preview Options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIncludePreview(!includePreview)}
              className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              {includePreview ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span>Include smart preview</span>
            </button>
          </div>

          {/* Link Actions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-black/20 border-white/10 text-white text-sm"
              />
              <Button
                onClick={() => copyToClipboard(shareUrl)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Copy Full Preview */}
            <Button
              onClick={() => copyToClipboard(generateSmartPreview())}
              variant="outline"
              className="w-full bg-black/20 border-white/10 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy with Preview
            </Button>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/80">Share to Platform</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => shareToSocial('twitter')}
                className="bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 text-white"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareToSocial('facebook')}
                className="bg-[#4267B2]/20 hover:bg-[#4267B2]/30 border border-[#4267B2]/30 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={shareToMessages}
                disabled={isSharing}
                className="bg-[#FE3F5E]/20 hover:bg-[#FE3F5E]/30 border border-[#FE3F5E]/30 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button
                onClick={() => shareToSocial('email')}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Share Analytics Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Share tracking enabled - see analytics in your dashboard</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}