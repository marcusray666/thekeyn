import { Router } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RecommendationRequestSchema = z.object({
  userId: z.string().optional(),
  context: z.string().default('dashboard'),
  limit: z.number().min(1).max(20).default(8),
});

interface UserActivity {
  recentUploads: string[];
  favoriteCategories: string[];
  interactionPatterns: string[];
  creationFrequency: string;
}

interface Recommendation {
  id: string;
  type: 'trending' | 'personalized' | 'similar' | 'inspiration';
  title: string;
  description: string;
  confidence: number;
  tags: string[];
  reason: string;
  actionUrl?: string;
  creatorName?: string;
  metrics?: {
    likes: number;
    shares: number;
    views: number;
  };
}

// Mock user activity data - in production, this would come from database
const getUserActivity = async (userId?: string): Promise<UserActivity> => {
  // This would fetch real user data from the database
  return {
    recentUploads: ['digital-art', 'photography', 'music'],
    favoriteCategories: ['art', 'design', 'photography'],
    interactionPatterns: ['evening-active', 'weekend-creator', 'high-engagement'],
    creationFrequency: 'weekly'
  };
};

// Mock trending data - in production, this would come from analytics
const getTrendingContent = async () => {
  return [
    { category: 'AI Art', growth: 45, engagement: 0.8 },
    { category: 'Photography', growth: 32, engagement: 0.7 },
    { category: 'Digital Design', growth: 28, engagement: 0.75 },
    { category: 'Music Production', growth: 25, engagement: 0.65 },
  ];
};

const generateRecommendations = async (
  userActivity: UserActivity,
  context: string,
  limit: number
): Promise<Recommendation[]> => {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI content recommendation engine for Loggin', a creative platform for digital artists and creators. 
          
          Generate personalized content recommendations based on user activity and context. Each recommendation should include:
          - A specific, actionable title
          - A compelling description
          - Confidence score (0.0-1.0)
          - Relevant tags
          - A brief reason for the recommendation
          - Recommendation type (trending, personalized, similar, inspiration)
          
          Focus on:
          - Creative trends and opportunities
          - Skill development suggestions  
          - Community engagement ideas
          - Monetization strategies
          - Collaboration opportunities
          
          Return exactly ${limit} recommendations in JSON format.`
        },
        {
          role: "user",
          content: `Generate content recommendations for a user with this profile:
          
          Recent uploads: ${userActivity.recentUploads.join(', ')}
          Favorite categories: ${userActivity.favoriteCategories.join(', ')}
          Interaction patterns: ${userActivity.interactionPatterns.join(', ')}
          Creation frequency: ${userActivity.creationFrequency}
          Current page context: ${context}
          
          Please provide ${limit} diverse recommendations covering different types (trending, personalized, similar, inspiration).
          
          Response format should be a JSON array of objects with this structure:
          {
            "id": "unique-id",
            "type": "trending|personalized|similar|inspiration",
            "title": "Specific recommendation title",
            "description": "Compelling 1-2 sentence description",
            "confidence": 0.85,
            "tags": ["tag1", "tag2", "tag3"],
            "reason": "Brief reason for this recommendation",
            "metrics": {
              "likes": 234,
              "shares": 45,
              "views": 1200
            }
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) throw new Error('No response from AI');

    const parsed = JSON.parse(aiResponse);
    
    // Ensure we have an array of recommendations
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    
    return recommendations.slice(0, limit).map((rec: any, index: number) => ({
      id: rec.id || `rec-${Date.now()}-${index}`,
      type: rec.type || 'personalized',
      title: rec.title || 'Trending Content',
      description: rec.description || 'Check out this trending content.',
      confidence: Math.min(Math.max(rec.confidence || 0.7, 0.0), 1.0),
      tags: Array.isArray(rec.tags) ? rec.tags.slice(0, 5) : [],
      reason: rec.reason || 'Based on your interests',
      actionUrl: rec.actionUrl,
      creatorName: rec.creatorName,
      metrics: rec.metrics || {
        likes: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 2000) + 200,
      }
    }));

  } catch (error) {
    console.error('AI recommendation generation error:', error);
    
    // Fallback recommendations if AI fails
    return generateFallbackRecommendations(userActivity, limit);
  }
};

const generateFallbackRecommendations = (
  userActivity: UserActivity,
  limit: number
): Recommendation[] => {
  const fallbacks: Recommendation[] = [
    {
      id: 'fallback-1',
      type: 'trending',
      title: 'AI-Generated Art is Trending',
      description: 'Explore the latest AI art techniques that are gaining popularity.',
      confidence: 0.8,
      tags: ['AI', 'Digital Art', 'Trending'],
      reason: 'High engagement in AI art category',
      metrics: { likes: 234, shares: 45, views: 1200 }
    },
    {
      id: 'fallback-2',
      type: 'personalized',
      title: 'Photography Portfolio Tips',
      description: 'Learn how to showcase your photography work more effectively.',
      confidence: 0.75,
      tags: ['Photography', 'Portfolio', 'Tips'],
      reason: 'Based on your recent photography uploads',
      metrics: { likes: 156, shares: 23, views: 890 }
    },
    {
      id: 'fallback-3',
      type: 'inspiration',
      title: 'Weekly Design Challenge',
      description: 'Join this week\'s creative challenge and get inspired by the community.',
      confidence: 0.7,
      tags: ['Challenge', 'Community', 'Design'],
      reason: 'Popular among active creators',
      metrics: { likes: 312, shares: 67, views: 1456 }
    },
    {
      id: 'fallback-4',
      type: 'similar',
      title: 'Discover Similar Artists',
      description: 'Find creators with similar styles and interests to yours.',
      confidence: 0.65,
      tags: ['Discovery', 'Artists', 'Network'],
      reason: 'Based on your interaction patterns',
      metrics: { likes: 89, shares: 12, views: 543 }
    },
  ];

  return fallbacks.slice(0, limit);
};

router.post('/recommendations', authenticateUser, async (req, res) => {
  try {
    const { userId, context, limit } = RecommendationRequestSchema.parse(req.body);
    const userActivity = await getUserActivity(userId);
    const recommendations = await generateRecommendations(userActivity, context, limit);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Additional AI endpoints
router.post('/analyze-content', authenticateUser, async (req, res) => {
  try {
    const { content, type } = req.body;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI content analyzer for creative works. Provide insights about the content including style, themes, potential audience, and improvement suggestions."
        },
        {
          role: "user",
          content: `Analyze this ${type} content: ${content}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    res.json(analysis);
  } catch (error) {
    console.error('Content analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

router.post('/suggest-tags', authenticateUser, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate relevant tags for creative content. Return 8-12 specific, searchable tags that would help others discover this content. Focus on style, technique, theme, and category. Return as a JSON array of strings."
        },
        {
          role: "user",
          content: `Generate tags for: Title: "${title}", Description: "${description}", Category: "${category}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const tags = result.tags || [];
    res.json({ tags });
  } catch (error) {
    console.error('Tag suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

export default router;