#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  🔥 FLAME BROWSER — Android APK Build Script
#  شغّل الملف ده وهو هيبني الـ APK تلقائياً
# ═══════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${RED}🔥 Flame Browser — Android Build${NC}"
echo "══════════════════════════════════"
echo ""

# ── Step 1: Check Node ──────────────────────────────────
echo -e "${BLUE}[1/6]${NC} Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js مش موجود. نزّله من nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VER${NC}"

# ── Step 2: Check EAS CLI ───────────────────────────────
echo -e "${BLUE}[2/6]${NC} Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
  echo -e "${YELLOW}⚙️  Installing EAS CLI...${NC}"
  npm install -g eas-cli
fi
echo -e "${GREEN}✅ EAS CLI ready${NC}"

# ── Step 3: Install deps ────────────────────────────────
echo -e "${BLUE}[3/6]${NC} Installing dependencies..."
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"

# ── Step 4: Check .env ──────────────────────────────────
echo -e "${BLUE}[4/6]${NC} Checking environment..."
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  ملف .env مش موجود — هنشتغل بدون Supabase${NC}"
  echo -e "    انسخ .env.example لـ .env وحطّ الـ keys بعدين"
else
  echo -e "${GREEN}✅ .env found${NC}"
fi

# ── Step 5: Login to Expo ───────────────────────────────
echo ""
echo -e "${BLUE}[5/6]${NC} Expo Login..."
echo -e "${YELLOW}هتحتاج حساب expo.dev (مجاني)${NC}"
echo -e "لو عندك حساب: eas login"
echo ""
echo -e "${YELLOW}اختار طريقة البناء:${NC}"
echo ""
echo "  1️⃣  EAS Cloud (أسهل — بيبني على سيرفرات Expo)"
echo "       npx eas build --platform android --profile preview"
echo ""
echo "  2️⃣  Expo Go (للتجربة السريعة بدون APK)"  
echo "       npx expo start"
echo "       ثم scan الـ QR من تطبيق Expo Go"
echo ""

# ── Step 6: Build ───────────────────────────────────────
echo -e "${BLUE}[6/6]${NC} Ready to build!"
echo ""
echo -e "${YELLOW}اختار:${NC}"
echo "  A) بناء APK على EAS Cloud (محتاج login)"
echo "  B) تشغيل محلي على Expo Go (بدون login)"
echo "  C) خروج"
echo ""
read -p "اختارك (A/B/C): " choice

case $choice in
  [Aa]*)
    echo ""
    echo -e "${GREEN}🚀 Building APK on EAS Cloud...${NC}"
    echo ""
    eas login
    eas build --platform android --profile preview --non-interactive
    echo ""
    echo -e "${GREEN}✅ Done! الـ APK هينزل تلقائياً من الرابط اللي ظهر${NC}"
    ;;
  [Bb]*)
    echo ""
    echo -e "${GREEN}🚀 Starting Expo Go...${NC}"
    echo ""
    echo "1. نزّل تطبيق 'Expo Go' من Google Play"
    echo "2. Scan الـ QR اللي هيظهر"
    echo ""
    npx expo start
    ;;
  [Cc]*)
    echo "Bye! 👋"
    exit 0
    ;;
  *)
    echo "اختيار مش صح — شغّل السكريبت تاني"
    ;;
esac
