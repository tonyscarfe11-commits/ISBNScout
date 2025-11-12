import OpenAI from 'openai';

export interface BookRecognitionResult {
  title?: string;
  author?: string;
  isbn?: string;
  condition?: string;
  description?: string;
  keywords: string[];
}

export interface KeywordOptimizationResult {
  keywords: string[];
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedTags: string[];
}

export class AIService {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (key) {
      this.openai = new OpenAI({
        apiKey: key,
      });
    }
  }

  private getClient(): OpenAI {
    if (!this.openai) {
      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      this.openai = new OpenAI({ apiKey: key });
    }
    return this.openai;
  }

  /**
   * Analyze a book image to extract information
   */
  async analyzeBookImage(imageUrl: string): Promise<BookRecognitionResult> {
    const openai = this.getClient();
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this book image and extract the following information:
- Book title
- Author name
- ISBN (if visible)
- Book condition (New, As New, Good, Acceptable, or Collectable)
- Brief description of the book's physical condition
- Relevant keywords for selling this book (genre, subject, notable features)

Return the information in JSON format with keys: title, author, isbn, condition, description, keywords (array).
If any information is not clearly visible, omit that field.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const result = JSON.parse(jsonMatch[0]) as BookRecognitionResult;
      return result;
    } catch (error: any) {
      console.error('Book image analysis failed:', error);
      throw new Error(error.message || 'Failed to analyze book image');
    }
  }

  /**
   * Generate optimized keywords and descriptions for listing
   */
  async optimizeListingKeywords(
    title: string,
    author?: string,
    isbn?: string,
    condition?: string,
    platform?: 'ebay' | 'amazon'
  ): Promise<KeywordOptimizationResult> {
    const openai = this.getClient();
    try {
      const platformGuidance = platform === 'ebay'
        ? 'eBay listings benefit from specific, searchable terms and details about condition, edition, and features.'
        : 'Amazon listings should focus on relevant categories, series information, and key selling points.';

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at optimizing book listings for online marketplaces. ${platformGuidance}`,
          },
          {
            role: "user",
            content: `Generate optimized listing content for this book:
Title: ${title}
Author: ${author || 'Unknown'}
ISBN: ${isbn || 'Not provided'}
Condition: ${condition || 'Good'}
Platform: ${platform || 'general'}

Provide:
1. keywords: Array of 10-15 relevant search keywords/phrases that buyers would use
2. optimizedTitle: An SEO-optimized title (keep original title but add relevant details)
3. optimizedDescription: A compelling 2-3 paragraph description highlighting key selling points
4. suggestedTags: Array of 5-8 category/genre tags

Return as JSON with keys: keywords, optimizedTitle, optimizedDescription, suggestedTags`,
          },
        ],
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const result = JSON.parse(jsonMatch[0]) as KeywordOptimizationResult;
      return result;
    } catch (error: any) {
      console.error('Keyword optimization failed:', error);
      throw new Error(error.message || 'Failed to optimize keywords');
    }
  }

  /**
   * Generate a comprehensive listing description
   */
  async generateListingDescription(
    title: string,
    author?: string,
    condition?: string,
    additionalNotes?: string
  ): Promise<string> {
    const openai = this.getClient();
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 'You are an expert at writing compelling book listing descriptions that attract buyers.',
          },
          {
            role: "user",
            content: `Write a compelling listing description for this book:
Title: ${title}
Author: ${author || 'Unknown'}
Condition: ${condition || 'Good'}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

The description should:
- Be 2-3 paragraphs
- Highlight the book's appeal and key features
- Mention the condition clearly
- Be professional and trustworthy
- Encourage purchases

Do not use markdown formatting. Return plain text only.`,
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return content.trim();
    } catch (error: any) {
      console.error('Description generation failed:', error);
      throw new Error(error.message || 'Failed to generate description');
    }
  }
}

// Export a singleton instance that will lazy-load the OpenAI client
let aiServiceInstance: AIService | null = null;

export const getAIService = (): AIService => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

// For backward compatibility
export const aiService = getAIService();
