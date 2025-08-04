#!/bin/bash

# Development environment setup script

echo "🔧 Setting up development environment..."

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

echo "✅ Development environment setup complete!"
echo "📝 Don't forget to:"
echo "1. Configure your .env file"
echo "2. Set up your Unicorn community"
echo "3. Run 'npm run dev' to begin development"
