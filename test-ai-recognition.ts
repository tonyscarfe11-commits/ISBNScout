/**
 * Test AI Book Recognition
 * Tests if OpenAI API is working correctly
 */

import { config } from 'dotenv';
import { AIService } from './server/ai-service';

config();

async function testAI() {
  console.log('\n=== Testing AI Book Recognition ===\n');

  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key:', apiKey ? apiKey.substring(0, 20) + '...' : '❌ MISSING');

  if (!apiKey) {
    console.error('\n❌ OPENAI_API_KEY not set!');
    process.exit(1);
  }

  const aiService = new AIService(apiKey);

  // Test with a simple book cover URL
  const testImageUrl = 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg';

  console.log('\n--- Testing with book cover URL ---');
  console.log('Image:', testImageUrl);
  console.log('(The Catcher in the Rye by J.D. Salinger)');
  console.log('\nAnalyzing...\n');

  try {
    const result = await aiService.analyzeBookImage(testImageUrl);

    console.log('✅ Recognition successful!\n');
    console.log('Results:');
    console.log('  Title:', result.title || 'Not found');
    console.log('  Author:', result.author || 'Not found');
    console.log('  ISBN:', result.isbn || 'Not found');
    console.log('  Publisher:', result.publisher || 'Not found');
    console.log('  Condition:', result.condition || 'Not assessed');
    console.log('  Image Type:', result.imageType || 'Unknown');
    console.log('  Keywords:', result.keywords.join(', '));

    if (result.description) {
      console.log('\n  Description:', result.description);
    }

    console.log('\n🎉 AI service is working correctly!');

  } catch (error: any) {
    console.error('\n❌ Recognition failed!');
    console.error('Error:', error.message);

    if (error.message.includes('quota')) {
      console.error('\n💡 This is a quota/billing issue. Check:');
      console.error('   1. platform.openai.com/account/billing');
      console.error('   2. Make sure you have credits');
      console.error('   3. Check API key is valid');
    } else if (error.message.includes('api key')) {
      console.error('\n💡 API key issue. Check:');
      console.error('   1. Is OPENAI_API_KEY set correctly in .env?');
      console.error('   2. Is the key valid?');
      console.error('   3. platform.openai.com/api-keys');
    } else {
      console.error('\n💡 Other error. Full details:', error);
    }

    process.exit(1);
  }
}

testAI();
