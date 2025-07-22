import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  requiresManualReview: boolean;
}

export interface ContentAnalysis {
  textModeration?: ModerationResult;
  imageModeration?: ModerationResult;
  plagiarismCheck?: ModerationResult;
  overallDecision: 'approved' | 'rejected' | 'pending_review';
}

class ContentModerationService {
  private bannedWords: string[] = [
    // Explicit content
    'porn', 'nude', 'naked', 'sex', 'xxx', 'adult', 'erotic',
    // Violence
    'kill', 'murder', 'death', 'violence', 'blood', 'gore', 'weapon',
    // Hate speech
    'hate', 'racist', 'nazi', 'terrorist', 'bomb', 'drug',
    // Add more as needed
  ];

  private suspiciousPatterns: RegExp[] = [
    /\b(free\s+money|get\s+rich|make\s+money\s+fast)\b/i,
    /\b(click\s+here|download\s+now|limited\s+time)\b/i,
    /\b(viagra|casino|gambling|lottery)\b/i,
    /\b(stolen|pirated|copyright\s+violation)\b/i,
  ];

  // Text content moderation using keyword filtering and pattern matching
  async moderateText(text: string, title?: string): Promise<ModerationResult> {
    const flags: string[] = [];
    let confidence = 0;
    
    const fullText = `${title || ''} ${text}`.toLowerCase();
    
    // Check for banned words
    const foundBannedWords = this.bannedWords.filter(word => 
      fullText.includes(word.toLowerCase())
    );
    
    if (foundBannedWords.length > 0) {
      flags.push('inappropriate_language');
      confidence += foundBannedWords.length * 0.3;
    }

    // Check for suspicious patterns
    const foundPatterns = this.suspiciousPatterns.filter(pattern => 
      pattern.test(fullText)
    );
    
    if (foundPatterns.length > 0) {
      flags.push('suspicious_content');
      confidence += foundPatterns.length * 0.4;
    }

    // Check for excessive caps (potential spam/shouting)
    const capsRatio = (fullText.match(/[A-Z]/g) || []).length / fullText.length;
    if (capsRatio > 0.5 && fullText.length > 20) {
      flags.push('excessive_caps');
      confidence += 0.2;
    }

    // Check for repeated characters (spam indicator)
    if (/(.)\1{4,}/.test(fullText)) {
      flags.push('spam_pattern');
      confidence += 0.3;
    }

    confidence = Math.min(confidence, 1.0);
    const requiresManualReview = confidence > 0.3;
    const isApproved = confidence < 0.7;

    return {
      isApproved,
      confidence,
      flags,
      reason: flags.length > 0 ? `Detected: ${flags.join(', ')}` : undefined,
      requiresManualReview
    };
  }

  // Image content moderation using file analysis
  async moderateImage(filePath: string): Promise<ModerationResult> {
    const flags: string[] = [];
    let confidence = 0;
    
    try {
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      
      // Check file size (unusually large files might be suspicious)
      if (stats.size > 50 * 1024 * 1024) { // 50MB
        flags.push('large_file_size');
        confidence += 0.2;
      }

      // Check for suspicious file extensions
      const suspiciousExtensions = ['.exe', '.bat', '.scr', '.com', '.pif'];
      if (suspiciousExtensions.includes(fileExtension)) {
        flags.push('suspicious_file_type');
        confidence += 0.8;
      }

      // Basic filename analysis
      const filename = path.basename(filePath).toLowerCase();
      const suspiciousFilenames = ['virus', 'hack', 'crack', 'keygen', 'adult', 'porn'];
      
      if (suspiciousFilenames.some(term => filename.includes(term))) {
        flags.push('suspicious_filename');
        confidence += 0.4;
      }

      // Check image dimensions (if it's an image)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (imageExtensions.includes(fileExtension)) {
        // For now, we'll do basic checks. In future, could integrate with image analysis APIs
        if (stats.size < 1024) { // Very small images might be suspicious
          flags.push('suspicious_image_size');
          confidence += 0.2;
        }
      }

    } catch (error) {
      flags.push('file_access_error');
      confidence = 0.5;
    }

    confidence = Math.min(confidence, 1.0);
    const requiresManualReview = confidence > 0.3;
    const isApproved = confidence < 0.6;

    return {
      isApproved,
      confidence,
      flags,
      reason: flags.length > 0 ? `Image analysis: ${flags.join(', ')}` : undefined,
      requiresManualReview
    };
  }

  // Plagiarism detection using content hashing and similarity
  async checkPlagiarism(
    content: string, 
    fileHash: string, 
    existingHashes: string[]
  ): Promise<ModerationResult> {
    const flags: string[] = [];
    let confidence = 0;

    // Check if exact file hash exists
    if (existingHashes.includes(fileHash)) {
      flags.push('exact_duplicate');
      confidence = 1.0;
    }

    // Simple text similarity check for content
    if (content && content.length > 50) {
      const contentHash = crypto.createHash('md5').update(content.toLowerCase()).digest('hex');
      
      // In a real implementation, you'd compare against a database of known content hashes
      // For now, we'll do basic duplicate detection
      
      // Check for common plagiarism indicators
      const plagiarismIndicators = [
        /copy.*paste/i,
        /downloaded.*from/i,
        /source.*material/i,
        /original.*author/i
      ];

      const foundIndicators = plagiarismIndicators.filter(pattern => 
        pattern.test(content)
      );
      
      if (foundIndicators.length > 0) {
        flags.push('plagiarism_indicators');
        confidence += foundIndicators.length * 0.3;
      }
    }

    confidence = Math.min(confidence, 1.0);
    const requiresManualReview = confidence > 0.5;
    const isApproved = confidence < 0.8;

    return {
      isApproved,
      confidence,
      flags,
      reason: flags.length > 0 ? `Plagiarism check: ${flags.join(', ')}` : undefined,
      requiresManualReview
    };
  }

  // Comprehensive content analysis
  async analyzeContent(
    text: string,
    title: string,
    filePath: string,
    fileHash: string,
    existingHashes: string[] = []
  ): Promise<ContentAnalysis> {
    const textModeration = await this.moderateText(text, title);
    const imageModeration = await this.moderateImage(filePath);
    const plagiarismCheck = await this.checkPlagiarism(text, fileHash, existingHashes);

    // Determine overall decision
    const allResults = [textModeration, imageModeration, plagiarismCheck];
    const hasRejection = allResults.some(result => !result.isApproved && result.confidence > 0.7);
    const requiresReview = allResults.some(result => result.requiresManualReview);

    let overallDecision: 'approved' | 'rejected' | 'pending_review';
    
    if (hasRejection) {
      overallDecision = 'rejected';
    } else if (requiresReview) {
      overallDecision = 'pending_review';
    } else {
      overallDecision = 'approved';
    }

    return {
      textModeration,
      imageModeration,
      plagiarismCheck,
      overallDecision
    };
  }

  // Update banned words list (admin function)
  updateBannedWords(newWords: string[]) {
    this.bannedWords = [...new Set([...this.bannedWords, ...newWords])];
  }

  // Get current moderation settings (admin function)
  getModerationSettings() {
    return {
      bannedWordsCount: this.bannedWords.length,
      patternsCount: this.suspiciousPatterns.length,
      version: '1.0.0'
    };
  }
}

export const contentModerationService = new ContentModerationService();