# ISBNScout Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (optional but recommended for AI features):

```bash
# Required for AI features (photo recognition, keyword optimization)
OPENAI_API_KEY=your-openai-api-key-here

# Database (if using PostgreSQL instead of in-memory storage)
# DATABASE_URL=postgresql://user:password@localhost:5432/isbnscout
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Features

### Core Features
- ✅ Book scanning via ISBN or photo
- ✅ Real-time price comparison (Amazon & eBay)
- ✅ Profit calculation
- ✅ Direct listing to eBay and Amazon FBA
- ✅ Offline mode support
- ✅ Mobile-first responsive design

### AI Features (Requires OPENAI_API_KEY)
- 🤖 AI book photo recognition
- 🎯 Automated keyword optimization for listings
- ✍️ AI-generated product descriptions
- 💡 Platform-specific SEO optimization

### Currency & Locale
- 💷 Currency: GBP (£)
- 🇬🇧 Country: United Kingdom
- 📦 Shipping: Royal Mail

### Book Conditions
- New
- As New
- Good
- Acceptable
- Collectable

## API Credentials Setup

### eBay API
1. Go to [eBay Developers Program](https://developer.ebay.com/)
2. Create an application
3. Get your credentials:
   - App ID (Client ID)
   - Cert ID (Client Secret)
   - Dev ID
   - Auth Token (optional for testing)
4. Add credentials in Settings → Marketplace Integrations

### Amazon Selling Partner API
1. Register for [Amazon Seller Central](https://sellercentral.amazon.co.uk/)
2. Apply for SP-API access
3. Create a developer application
4. Get your credentials:
   - Client ID
   - Client Secret
   - Refresh Token
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Selling Partner Role ARN
5. Add credentials in Settings → Marketplace Integrations

### OpenAI API (for AI features)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Set environment variable: `OPENAI_API_KEY=your-key`

## Project Structure

```
ISBNScoutOffline/
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities
├── server/              # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data storage layer
│   ├── ebay-service.ts # eBay API integration
│   ├── amazon-service.ts # Amazon SP-API integration
│   └── ai-service.ts   # OpenAI integration
├── shared/              # Shared types/schemas
│   └── schema.ts       # Database schema
└── AI_FEATURES.md      # AI features documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Troubleshooting

### "Missing credentials" error
Make sure `OPENAI_API_KEY` is set in your environment or `.env` file.

### Port already in use
Kill existing processes:
```bash
pkill -f "tsx server"
npm run dev
```

### eBay/Amazon API errors
1. Verify credentials in Settings
2. Check that your application is approved
3. Ensure you're using the correct marketplace IDs:
   - eBay UK: EBAY-GB
   - Amazon UK: A1F83G8C2ARO7P

### TypeScript errors
Run type checking:
```bash
npm run check
```

## Support

For issues or questions:
- Check `AI_FEATURES.md` for AI-specific documentation
- Review `design_guidelines.md` for UI/UX guidelines
- Check console logs for detailed error messages

## License

MIT
