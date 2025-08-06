import crypto from "crypto";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

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
  private ai: GoogleGenAI;
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

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  // Text content moderation using AI-powered analysis with Gemini
  async moderateText(text: string, title?: string): Promise<ModerationResult> {
    const flags: string[] = [];
    let confidence = 0;
    
    const fullText = `${title || ''} ${text}`.toLowerCase();
    
    // First, do basic keyword filtering for obvious cases
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

    // Enhanced AI moderation using Gemini
    try {
      if (this.ai && (title || text) && (title?.length > 5 || text?.length > 10)) {
        const prompt = `Analyze this content for appropriateness in a creative work protection platform:

Title: "${title || 'No title'}"
Description: "${text || 'No description'}"

Please evaluate for:
1. Inappropriate content (violence, adult content, hate speech)
2. Spam or promotional content
3. Copyright violations or plagiarism indicators
4. Harmful or misleading information

Respond with JSON in this format:
{
  "isAppropriate": true/false,
  "confidenceScore": 0.0-1.0,
  "issues": ["list", "of", "issues"],
  "reasoning": "brief explanation"
}`;

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                isAppropriate: { type: "boolean" },
                confidenceScore: { type: "number" },
                issues: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" }
              },
              required: ["isAppropriate", "confidenceScore", "issues", "reasoning"]
            }
          },
          contents: prompt
        });

        const aiResult = JSON.parse(response.text || '{}');
        
        // Only add flags for serious issues if AI says content is inappropriate
        if (!aiResult.isAppropriate && aiResult.issues && aiResult.issues.length > 0) {
          flags.push(...aiResult.issues.map((issue: string) => `ai_detected_${issue.replace(/\s+/g, '_').toLowerCase()}`));
        }
        
        // Use AI decision as primary factor
        const aiConfidence = aiResult.confidenceScore || 0;
        
        // If AI says content is appropriate, override basic analysis confidence
        if (aiResult.isAppropriate) {
          confidence = Math.min(confidence, 0.2); // Low confidence for rejection
        } else {
          confidence = Math.max(confidence, aiConfidence);
        }
        
        console.log('AI Content Moderation Result:', {
          isAppropriate: aiResult.isAppropriate,
          confidence: aiConfidence,
          issues: aiResult.issues,
          reasoning: aiResult.reasoning
        });
      }
    } catch (error) {
      console.warn('AI moderation failed, falling back to basic analysis:', error);
      // Continue with basic analysis
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
    const requiresManualReview = confidence > 0.5;
    const isApproved = confidence < 0.8;

    return {
      isApproved,
      confidence,
      flags,
      reason: flags.length > 0 ? `Detected: ${flags.join(', ')}` : undefined,
      requiresManualReview
    };
  }

  // Image content moderation using AI-powered analysis with Gemini
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

      // AI-powered image analysis for images
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (imageExtensions.includes(fileExtension) && this.ai) {
        try {
          const imageBytes = fs.readFileSync(filePath);
          const mimeType = `image/${fileExtension.slice(1) === 'jpg' ? 'jpeg' : fileExtension.slice(1)}`;
          
          const contents = [
            {
              inlineData: {
                data: imageBytes.toString("base64"),
                mimeType: mimeType,
              },
            },
            `Analyze this image for content appropriateness in a creative work protection platform. Look for:
1. Inappropriate content (nudity, violence, hate symbols)
2. Copyright violations (logos, branded content)
3. Spam or promotional content
4. Low quality or suspicious images

Respond with JSON:
{
  "isAppropriate": true/false,
  "confidenceScore": 0.0-1.0,
  "issues": ["list", "of", "issues"],
  "reasoning": "brief explanation"
}`,
          ];

          const response = await this.ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  isAppropriate: { type: "boolean" },
                  confidenceScore: { type: "number" },
                  issues: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" }
                },
                required: ["isAppropriate", "confidenceScore", "issues", "reasoning"]
              }
            },
            contents: contents,
          });

          const aiResult = JSON.parse(response.text || '{}');
          
          // Only add flags for serious issues if AI says image is inappropriate
          if (!aiResult.isAppropriate && aiResult.issues && aiResult.issues.length > 0) {
            flags.push(...aiResult.issues.map((issue: string) => `ai_image_${issue.replace(/\s+/g, '_').toLowerCase()}`));
          }
          
          const aiConfidence = aiResult.confidenceScore || 0;
          
          // If AI says image is appropriate, override basic analysis confidence
          if (aiResult.isAppropriate) {
            confidence = Math.min(confidence, 0.2); // Low confidence for rejection
          } else {
            confidence = Math.max(confidence, aiConfidence);
          }
          
          console.log('AI Image Moderation Result:', {
            filename: path.basename(filePath),
            isAppropriate: aiResult.isAppropriate,
            confidence: aiConfidence,
            issues: aiResult.issues,
            reasoning: aiResult.reasoning
          });
          
        } catch (aiError) {
          console.warn('AI image analysis failed, falling back to basic analysis:', aiError);
          // Continue with basic checks
        }
      }

      // Basic size checks for images
      if (imageExtensions.includes(fileExtension)) {
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
    const requiresManualReview = confidence > 0.5;
    const isApproved = confidence < 0.8;

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

    // Determine overall decision - be more lenient, trust AI analysis
    const allResults = [textModeration, imageModeration, plagiarismCheck];
    
    // Only reject if there's a high-confidence serious issue
    const hasSerious = allResults.some(result => !result.isApproved && result.confidence > 0.8);
    const hasHighRisk = allResults.some(result => result.confidence > 0.9);
    const requiresReview = allResults.some(result => result.requiresManualReview && result.confidence > 0.6);

    let overallDecision: 'approved' | 'rejected' | 'pending_review';
    
    if (hasHighRisk) {
      overallDecision = 'rejected';
    } else if (hasSerious || requiresReview) {
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