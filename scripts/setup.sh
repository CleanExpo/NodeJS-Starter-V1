#!/bin/bash
set -e

echo "========================================"
echo "  Claude Agent Orchestration Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is required but not installed.${NC}"
        echo "Please install $1 and try again."
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $1 found"
}

echo "Checking prerequisites..."
check_command node
check_command pnpm
check_command uv

echo ""

# Get project name
read -p "Enter project name (default: my-project): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-my-project}

echo ""
echo "Setting up project: $PROJECT_NAME"
echo ""

# Update package.json name
echo "Updating project name..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"name\": \"claude-agent-orchestration-template\"/\"name\": \"$PROJECT_NAME\"/" package.json
else
    sed -i "s/\"name\": \"claude-agent-orchestration-template\"/\"name\": \"$PROJECT_NAME\"/" package.json
fi

# Copy environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ Please update .env.local with your API keys${NC}"
else
    echo ".env.local already exists, skipping..."
fi

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
pnpm install

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd apps/backend
uv sync
cd ../..

# Initialize Supabase (if CLI installed)
if command -v supabase &> /dev/null; then
    echo ""
    echo "Initializing Supabase..."
    supabase init --workdir . || true
else
    echo -e "${YELLOW}⚠ Supabase CLI not found. Install it for local development:${NC}"
    echo "  npm install -g supabase"
fi

echo ""
echo "========================================"
echo -e "${GREEN}  Setup complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your API keys"
echo "  2. Run 'pnpm dev' to start development"
echo "  3. Run 'supabase start' for local database"
echo ""
echo "For more information, see README.md"
echo ""
