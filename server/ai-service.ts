import OpenAI from 'openai';

export interface BookRecognitionResult {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  series?: string;
  condition?: string;
  description?: string;
  keywords: string[];
  imageType?: 'cover' | 'spine' | 'unknown';
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
   * Supports both cover photos and spine photos (unique competitive advantage)
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
                text: `You are analyzing a book image that could be either a COVER or a SPINE photo.

IMPORTANT FOR SPINE PHOTOS:
- Text often runs vertically (top to bottom or bottom to top)
- Title and author may be abbreviated or partially visible
- Look for publisher logos, series information, ISBN barcodes
- The spine typically shows: Title | Author | Publisher logo
- Text might be rotated 90 degrees - read it carefully

IMPORTANT FOR COVER PHOTOS:
- Look for title (usually largest text)
- Author name (often below title)
- ISBN barcode (usually on back cover)
- Publisher information
- Cover art and design elements

Extract the following information:
1. Book title - Even if abbreviated on spine, provide the full recognized title
2. Author name - Look carefully, might be initials or last name only on spine
3. ISBN - Check for barcode on spine or back cover (10 or 13 digits)
4. Publisher - If visible from logos or text
5. Series/Edition info - If this is part of a series
6. Book condition assessment:
   - New: Pristine, no wear
   - Like New: Minimal wear, appears unread
   - Very Good: Minor wear, clean pages
   - Good: Normal wear, all pages intact
   - Acceptable: Heavy wear but readable
7. Physical condition notes - Describe any visible damage, wear, spine creases, cover condition
8. Relevant keywords - Genre, subject matter, notable features for selling

Return ONLY valid JSON with these exact keys: 
{
  "title": "string or omit if not visible",
  "author": "string or omit if not visible", 
  "isbn": "string (digits only) or omit if not visible",
  "publisher": "string or omit if not visible",
  "series": "string or omit if not applicable",
  "condition": "New|Like New|Very Good|Good|Acceptable",
  "description": "brief physical condition description",
  "keywords": ["array", "of", "relevant", "terms"],
  "imageType": "cover|spine|unknown"
}

If any field is not clearly visible, omit it from the response. Do not guess.`,
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
