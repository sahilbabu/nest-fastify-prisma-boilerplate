#!/bin/bash

# Mail Service Test Script - Mailtrap Integration
# This script tests the mail service endpoints with Mailtrap

BASE_URL="http://localhost:5123"

echo "📧 Testing Mail Service with Mailtrap"
echo "====================================="

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s "$BASE_URL/api/v1" > /dev/null; then
    echo "❌ Server is not running. Please start the server first with: yarn start:dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test simple email first (most basic test)
echo "📩 Testing simple email..."
curl -X POST "$BASE_URL/api/v1/mail/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email - Simple",
    "html": "<h1>Hello from NestJS!</h1><p>This is a test email from the mail service using Mailtrap.</p>"
  }' | jq '.'

echo ""
echo "================================="

# Test welcome email
echo "📧 Testing welcome email template..."
curl -X POST "$BASE_URL/api/v1/mail/test/welcome" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "welcome@example.com",
    "name": "New User"
  }' | jq '.'

echo ""
echo "================================="

# Test password reset email
echo "🔑 Testing password reset email..."
curl -X POST "$BASE_URL/api/v1/mail/test/password-reset" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reset@example.com",
    "name": "Test User",
    "resetLink": "https://yourapp.com/reset?token=test123"
  }' | jq '.'

echo ""
echo "================================="

# Test verification email
echo "✉️ Testing verification email..."
curl -X POST "$BASE_URL/api/v1/mail/test/verification" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verify@example.com",
    "name": "Test User",
    "verificationLink": "https://yourapp.com/verify?token=test123"
  }' | jq '.'

echo ""
echo "================================="
echo "✅ Mail service tests completed!"
echo ""
echo "� Check your Mailtrap inbox at: https://mailtrap.io/inboxes"
echo "   All test emails should appear in your Mailtrap sandbox."
