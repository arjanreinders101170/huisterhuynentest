#!/bin/bash

# Kleuren
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}HTH Landing Page — Directory Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Navigate to repo
cd /workspaces/huisterhuynentest || exit 1

echo -e "${YELLOW}Creating directories...${NC}\n"

# Create component directory if not exists
mkdir -p src/components
echo -e "${GREEN}✓${NC} src/components"

# Create app directories
mkdir -p src/app/landing
echo -e "${GREEN}✓${NC} src/app/landing"

mkdir -p src/app/privacy
echo -e "${GREEN}✓${NC} src/app/privacy"

mkdir -p src/app/terms
echo -e "${GREEN}✓${NC} src/app/terms"

# API directories
mkdir -p src/app/api/admin/data
echo -e "${GREEN}✓${NC} src/app/api/admin/data"

echo -e "\n${YELLOW}Directory structure created!${NC}\n"

# Show what needs to be copied
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Next steps: Copy these files${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo "1. AvailabilityCalendar.tsx"
echo "   → src/components/AvailabilityCalendar.tsx\n"

echo "2. landing-page.tsx"
echo "   → src/app/landing/page.tsx\n"

echo "3. privacy-page.tsx"
echo "   → src/app/privacy/page.tsx\n"

echo "4. terms-page.tsx"
echo "   → src/app/terms/page.tsx\n"

echo "5. admin-page.tsx"
echo "   → src/app/admin/page.tsx (REPLACE!)\n"

echo "6. admin-data-route.ts"
echo "   → src/app/api/admin/data/route.ts (REPLACE!)\n"

echo -e "${YELLOW}After copying, run:${NC}"
echo "npx next build"
echo "git add -A"
echo "git commit -m 'Landing page setup'"
echo "git push origin main"
echo ""
