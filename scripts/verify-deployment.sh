#!/bin/bash

# ISBNScout Production Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh <production-url>
# Example: ./scripts/verify-deployment.sh https://isbnscout.up.railway.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROD_URL=$1

if [ -z "$PROD_URL" ]; then
    echo -e "${RED}Error: Please provide production URL${NC}"
    echo "Usage: ./scripts/verify-deployment.sh <production-url>"
    echo "Example: ./scripts/verify-deployment.sh https://isbnscout.up.railway.app"
    exit 1
fi

echo "🚀 ISBNScout Deployment Verification"
echo "=================================="
echo "Testing: $PROD_URL"
echo ""

# Test 1: Health Check
echo "1. Testing health check endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
if [ "$STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed (200 OK)${NC}"
else
    echo -e "${RED}✗ Health check failed (Status: $STATUS)${NC}"
    exit 1
fi

# Test 2: API Response
echo ""
echo "2. Testing API response..."
RESPONSE=$(curl -s "$PROD_URL/")
if [ ! -z "$RESPONSE" ]; then
    echo -e "${GREEN}✓ API responding${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}✗ No response from API${NC}"
    exit 1
fi

# Test 3: CORS Headers
echo ""
echo "3. Checking CORS headers..."
CORS_HEADER=$(curl -s -I "$PROD_URL/" | grep -i "access-control-allow-origin" || echo "")
if [ ! -z "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ CORS headers present${NC}"
    echo "   $CORS_HEADER"
else
    echo -e "${YELLOW}⚠ No CORS headers (may need to configure for mobile)${NC}"
fi

# Test 4: SSL/TLS
echo ""
echo "4. Checking SSL/TLS..."
if [[ $PROD_URL == https* ]]; then
    SSL_INFO=$(curl -s -I "$PROD_URL/" | head -n 1)
    echo -e "${GREEN}✓ Using HTTPS${NC}"
    echo "   $SSL_INFO"
else
    echo -e "${RED}✗ Not using HTTPS (required for production)${NC}"
    exit 1
fi

# Test 5: Database Connection (via auth endpoint)
echo ""
echo "5. Testing database connection..."
TEST_USER="test_$(date +%s)@example.com"
TEST_PASS="TestPass123!"
REGISTER_RESPONSE=$(curl -s -X POST "$PROD_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"testuser_$(date +%s)\",\"email\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Database connection working (user creation successful)${NC}"
    echo "   Created test user: $TEST_USER"
elif [ "$HTTP_CODE" -eq 400 ] && [[ $RESPONSE_BODY == *"already exists"* ]]; then
    echo -e "${GREEN}✓ Database connection working (user already exists)${NC}"
else
    echo -e "${RED}✗ Database connection may have issues${NC}"
    echo "   Status: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
fi

# Test 6: Static Assets
echo ""
echo "6. Testing static assets..."
STATIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/assets/index.css" 2>/dev/null || echo "404")
if [ "$STATIC_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Static assets accessible${NC}"
elif [ "$STATIC_STATUS" -eq 404 ]; then
    echo -e "${YELLOW}⚠ Static assets not found (may need to run build)${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify static assets${NC}"
fi

# Test 7: API Endpoints
echo ""
echo "7. Testing key API endpoints..."

# Test books endpoint (should require auth)
BOOKS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/books")
if [ "$BOOKS_STATUS" -eq 401 ]; then
    echo -e "${GREEN}✓ Books API protected (requires auth)${NC}"
elif [ "$BOOKS_STATUS" -eq 200 ]; then
    echo -e "${YELLOW}⚠ Books API accessible without auth (check security)${NC}"
else
    echo -e "${RED}✗ Books API unexpected status: $BOOKS_STATUS${NC}"
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}✅ Deployment verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test mobile app connection to $PROD_URL"
echo "2. Scan a book and verify data saves to database"
echo "3. Check Neon console for new records"
echo "4. Monitor logs for errors"
echo ""
echo "Monitoring commands:"
echo "  Railway: railway logs"
echo "  Fly.io: fly logs"
echo ""
