# AI Features Documentation

## Overview
ISBNScout now includes AI-powered features for photo recognition and listing optimization using OpenAI's GPT-4 Vision API.

## Setup

### Required Environment Variable
Add your OpenAI API key to your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or add it to a `.env` file in the root directory:
```
OPENAI_API_KEY=your-api-key-here
```

## Features

### 1. Book Photo Recognition

**Location:** Scan Page (main scanning interface)

**How to use:**
1. Navigate to the Scan page
2. Find the "AI Book Recognition" card
3. Either:
   - Enter a URL to a book image
   - Upload a photo from your device
4. Click "Recognize Book with AI"

**What it extracts:**
- Book title
- Author name
- ISBN (if visible on the image)
- Book condition assessment
- Brief description of physical condition
- Relevant keywords for selling

### 2. AI Listing Optimization

**Location:** Listings Page → Create New Listing

**How to use:**
1. When creating a new listing, fill in basic book information
2. Click the "AI Optimize" button (with sparkles icon)
3. AI will generate:
   - 10-15 relevant search keywords
   - Optimized title with SEO enhancements
   - Compelling 2-3 paragraph description
   - Suggested category/genre tags

**The keywords will appear as badges below the book title**

### 3. AI Description Generator

**Location:** Both Amazon and eBay tabs in listing form

**How to use:**
1. In the description field, click "Generate with AI"
2. AI will create a professional, compelling description based on:
   - Book title
   - Author
   - Condition
   - Any notes you've already entered

**Benefits:**
- Professional, trustworthy tone
- Highlights key selling points
- Condition clearly mentioned
- Encourages purchases

## Platform-Specific Optimization

The AI considers the platform (eBay vs Amazon) when generating keywords:

- **eBay:** Focuses on specific searchable terms, condition details, and unique features
- **Amazon:** Emphasizes categories, series information, and key selling points

## API Endpoints

### POST /api/ai/analyze-image
Analyze a book image to extract information
```json
{
  "imageUrl": "https://example.com/book.jpg"
}
```

### POST /api/ai/optimize-keywords
Generate optimized keywords and content
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "1234567890",
  "condition": "good",
  "platform": "ebay"
}
```

### POST /api/ai/generate-description
Generate listing description
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "condition": "good",
  "additionalNotes": "Optional notes"
}
```

## Cost Considerations

- Uses `gpt-4o-mini` model for cost efficiency
- Image analysis: ~150-200 tokens per request
- Keyword optimization: ~300-400 tokens per request
- Description generation: ~200-300 tokens per request

Estimated cost per operation: < $0.01

## Best Practices

1. **Photo Quality:** Use clear, well-lit images showing the book cover and spine
2. **Keywords:** Review and customize AI-generated keywords for your market
3. **Descriptions:** Feel free to edit AI descriptions to add personal touches
4. **Testing:** Try the AI features with a few test listings first

## Troubleshooting

### "Failed to analyze image"
- Ensure OPENAI_API_KEY is set correctly
- Check that the image URL is publicly accessible
- Verify the image is clear and shows the book

### "Failed to optimize with AI"
- Verify OPENAI_API_KEY environment variable is set
- Check console logs for detailed error messages
- Ensure you have OpenAI API credits available

## Future Enhancements

Potential improvements:
- Bulk photo processing
- Multi-language support
- Custom prompt templates
- A/B testing different descriptions
- Price optimization suggestions based on market data
