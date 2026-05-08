#!/bin/bash

# Kleuren
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}HTH — Full Deployment Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if in right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root${NC}"
    echo "Run from: /workspaces/huisterhuynentest"
    exit 1
fi

cd /workspaces/huisterhuynentest

echo -e "${YELLOW}Step 1: Creating directory structure...${NC}\n"

# Create all necessary directories
mkdir -p src/components
mkdir -p src/app/landing
mkdir -p src/app/privacy
mkdir -p src/app/terms
mkdir -p src/app/api/admin/data

echo -e "${GREEN}✓ All directories created${NC}\n"

echo -e "${YELLOW}Step 2: Copy files (if available)...${NC}\n"

# Define source and destination pairs
declare -a FILES=(
    "/mnt/user-data/outputs/landing-page-deploy/AvailabilityCalendar.tsx:src/components/AvailabilityCalendar.tsx"
    "/mnt/user-data/outputs/landing-page-deploy/landing-page.tsx:src/app/landing/page.tsx"
    "/mnt/user-data/outputs/privacy-page.tsx:src/app/privacy/page.tsx"
    "/mnt/user-data/outputs/terms-page.tsx:src/app/terms/page.tsx"
    "/mnt/user-data/outputs/landing-page-deploy/admin-page.tsx:src/app/admin/page.tsx"
    "/mnt/user-data/outputs/landing-page-deploy/admin-data-route.ts:src/app/api/admin/data/route.ts"
)

for pair in "${FILES[@]}"; do
    IFS=':' read -r src dst <<< "$pair"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "${GREEN}✓${NC} $(basename $dst)"
    else
        echo -e "${YELLOW}⊘${NC} $(basename $dst) (file not found at $src)"
    fi
done

echo ""
echo -e "${YELLOW}Step 3: Verify structure...${NC}\n"

# Check if files exist
if [ -f "src/components/AvailabilityCalendar.tsx" ]; then
    echo -e "${GREEN}✓ AvailabilityCalendar.tsx${NC}"
else
    echo -e "${RED}✗ AvailabilityCalendar.tsx${NC}"
fi

if [ -f "src/app/landing/page.tsx" ]; then
    echo -e "${GREEN}✓ Landing page${NC}"
else
    echo -e "${RED}✗ Landing page${NC}"
fi

if [ -f "src/app/privacy/page.tsx" ]; then
    echo -e "${GREEN}✓ Privacy page${NC}"
else
    echo -e "${RED}✗ Privacy page${NC}"
fi

if [ -f "src/app/terms/page.tsx" ]; then
    echo -e "${GREEN}✓ Terms page${NC}"
else
    echo -e "${RED}✗ Terms page${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Ready to deploy!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Next commands:${NC}\n"
echo "npx next build"
echo "git add -A"
echo 'git commit -m "feat: Landing page + availability calendar"'
echo "git push origin main"
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}\n"
