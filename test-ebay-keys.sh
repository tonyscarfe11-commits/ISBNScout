#!/bin/bash

# Test eBay App IDs to see which one works

PRODUCTION_APP_ID="TonyScar-ISBNScou-PRD-96e5fa804-c9aa799d"
SANDBOX_APP_ID=""  # You'll need to add your sandbox App ID here

TEST_ISBN="9780747532699"

echo "════════════════════════════════════════════"
echo "  eBay API Key Tester"
echo "════════════════════════════════════════════"
echo ""

# Test Production
echo "🔄 Testing PRODUCTION App ID..."
echo "   App ID: $PRODUCTION_APP_ID"
echo ""

PROD_RESPONSE=$(curl -s "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByProduct&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${PRODUCTION_APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD=&paginationInput.entriesPerPage=5&productId.@type=ISBN&productId=${TEST_ISBN}&GLOBAL-ID=EBAY-GB")

if echo "$PROD_RESPONSE" | grep -q "errorMessage"; then
    echo "❌ PRODUCTION: FAILED"
    ERROR_ID=$(echo "$PROD_RESPONSE" | grep -o '"errorId":\["[0-9]*"\]' | head -1 | grep -o '[0-9]*')
    ERROR_MSG=$(echo "$PROD_RESPONSE" | grep -o '"message":\["[^"]*"\]' | head -1 | sed 's/"message":\["\(.*\)"\]/\1/')
    echo "   Error ID: $ERROR_ID"
    echo "   Message: $ERROR_MSG"
    echo ""

    if [ "$ERROR_ID" = "11002" ]; then
        echo "   💡 Error 11002 = Invalid Application"
        echo "      This means:"
        echo "      - App ID is incorrect"
        echo "      - OR App is not activated for production"
        echo "      - OR Wrong keyset (sandbox vs production)"
        echo ""
    fi
elif echo "$PROD_RESPONSE" | grep -q "findItemsByProductResponse"; then
    echo "✅ PRODUCTION: SUCCESS!"
    COUNT=$(echo "$PROD_RESPONSE" | grep -o '"@count":"[0-9]*"' | head -1 | grep -o '[0-9]*')
    echo "   Found $COUNT listings"
    echo ""
else
    echo "⚠️  PRODUCTION: Unknown response"
    echo "   Response: ${PROD_RESPONSE:0:200}..."
    echo ""
fi

# Test Sandbox (if App ID provided)
if [ -n "$SANDBOX_APP_ID" ]; then
    echo "────────────────────────────────────────────"
    echo ""
    echo "🔄 Testing SANDBOX App ID..."
    echo "   App ID: $SANDBOX_APP_ID"
    echo ""

    SANDBOX_RESPONSE=$(curl -s "https://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByProduct&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${SANDBOX_APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD=&paginationInput.entriesPerPage=5&productId.@type=ISBN&productId=${TEST_ISBN}&GLOBAL-ID=EBAY-GB")

    if echo "$SANDBOX_RESPONSE" | grep -q "errorMessage"; then
        echo "❌ SANDBOX: FAILED"
        ERROR_ID=$(echo "$SANDBOX_RESPONSE" | grep -o '"errorId":\["[0-9]*"\]' | head -1 | grep -o '[0-9]*')
        ERROR_MSG=$(echo "$SANDBOX_RESPONSE" | grep -o '"message":\["[^"]*"\]' | head -1 | sed 's/"message":\["\(.*\)"\]/\1/')
        echo "   Error ID: $ERROR_ID"
        echo "   Message: $ERROR_MSG"
        echo ""
    elif echo "$SANDBOX_RESPONSE" | grep -q "findItemsByProductResponse"; then
        echo "✅ SANDBOX: SUCCESS!"
        COUNT=$(echo "$SANDBOX_RESPONSE" | grep -o '"@count":"[0-9]*"' | head -1 | grep -o '[0-9]*')
        echo "   Found $COUNT listings (sandbox data)"
        echo ""
    else
        echo "⚠️  SANDBOX: Unknown response"
        echo ""
    fi
fi

echo "════════════════════════════════════════════"
echo ""
echo "📋 Summary:"
echo ""
echo "To fix this, check https://developer.ebay.com/my/keys and:"
echo "1. Verify your Production App ID is EXACTLY:"
echo "   $PRODUCTION_APP_ID"
echo ""
echo "2. Check the app status shows 'Active' or 'Approved'"
echo ""
echo "3. If App ID doesn't match, update .env with correct one"
echo ""
echo "4. If you have a DIFFERENT Production App ID, let me know"
echo "   and I'll help you test that one instead"
echo ""
echo "════════════════════════════════════════════"
