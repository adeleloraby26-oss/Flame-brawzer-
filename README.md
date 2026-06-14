# 🔥 Flame Browser

> A revolutionary mobile browser built with React Native + Expo + Supabase.
> تجربة متصفح من المستقبل — مبني بـ React Native + Expo + Supabase.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Supabase keys
cp .env.example .env

# 3. Run on your device / emulator
npx expo start
```

---

## 🗄️ Supabase Setup (من الصفر)

### الخطوة 1 — إنشاء مشروع Supabase
1. روح على [supabase.com](https://supabase.com) وسجّل دخول
2. اضغط **New Project**
3. اختار اسم وكلمة سر قاعدة البيانات واضغط **Create**
4. انتظر ~2 دقيقة حتى يتجهّز المشروع

### الخطوة 2 — تشغيل الـ SQL Schema
1. في الـ Dashboard افتح **SQL Editor → New Query**
2. افتح الملف `supabase/schema.sql` من المشروع
3. انسخ **كل** المحتوى والصقه في الـ Editor
4. اضغط **Run** (أو Ctrl+Enter)
5. لازم تشوف رسالة "Success" لكل الـ statements

### الخطوة 3 — الـ API Keys
1. في الـ Dashboard افتح **Settings → API**
2. انسخ:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `EXPO_PUBLIC_SUPABASE_ANON`
3. احطهم في ملف `.env`

### الخطوة 4 — تفعيل Authentication
1. افتح **Authentication → Providers**
2. تأكّد إن **Email** provider مفعّل
3. في **Authentication → URL Configuration** حطّ:
   - Site URL: `exp://localhost:8081`
   - Redirect URLs: `exp://localhost:8081`

---

## 🗃️ Database Schema

| Table | Description |
|---|---|
| `profiles` | بيانات المستخدم + الإعدادات + الـ XP |
| `bookmarks` | المفضّلة |
| `bookmark_folders` | مجلدات المفضّلة |
| `history` | تاريخ التصفّح |
| `downloads` | التحميلات |
| `tab_sessions` | جلسات التابات (sync بين الأجهزة) |
| `search_engines` | محركات البحث |
| `xp_events` | سجل نقاط الخبرة |

### Postgres Functions
| Function | الوظيفة |
|---|---|
| `upsert_history(user_id, url, title, favicon)` | تسجيل زيارة أو تحديث عدد الزيارات |
| `add_xp(user_id, event, xp, metadata)` | إضافة XP وتحديث الـ rank تلقائياً |
| `handle_new_user()` | إنشاء profile تلقائياً عند التسجيل |

---

## 🏗️ Project Structure

```
flame-browser/
├── App.tsx                     # Root — auth flow + screen router
├── supabase/
│   └── schema.sql              # 🗄️ Complete SQL (run this first!)
├── services/supabase/
│   ├── client.ts               # Supabase client + DB types
│   ├── auth.ts                 # Sign in / sign up / session
│   ├── profile.ts              # Profile + settings + XP
│   ├── bookmarks.ts            # Bookmarks CRUD + realtime
│   ├── history.ts              # History upsert + search
│   ├── downloads.ts            # Downloads tracking
│   ├── tabSessions.ts          # Tab sync across devices
│   └── index.ts                # Barrel export
├── store/
│   └── browserStore.ts         # Zustand store (optimistic + Supabase sync)
├── screens/
│   ├── SplashScreen.tsx        # Animated splash
│   ├── AuthScreen.tsx          # Sign in / sign up UI
│   ├── HomeScreen.tsx          # Home with widgets & stats
│   ├── BrowserScreen.tsx       # WebView browser
│   ├── TabsScreen.tsx          # Arc-style tab cards
│   ├── BookmarksScreen.tsx     # Bookmarks list
│   ├── HistoryScreen.tsx       # Browsing history
│   ├── SettingsScreen.tsx      # VisionOS settings
│   ├── ProfileScreen.tsx       # Profile + XP + stats
│   └── DownloadsScreen.tsx     # Download manager
├── components/
│   ├── browser/
│   │   ├── SearchBar.tsx       # Morphing address bar
│   │   └── SearchSuggestions.tsx
│   ├── cards/
│   │   └── GlassCard.tsx       # Glassmorphism card
│   ├── navigation/
│   │   └── BottomNavBar.tsx    # Floating glass nav
│   └── svg/
│       └── FlameLogo.tsx       # Animated SVG flame
├── types/index.ts              # All TypeScript types
└── utils/design.ts             # Design tokens

```

---

## ✨ Features

- 🔥 **AMOLED dark** glassmorphism UI
- 🔐 **Supabase Auth** — email sign in/up
- ☁️ **Cloud sync** — bookmarks, history, settings, downloads
- ⚡ **Realtime** — live updates across devices
- 🏆 **XP & Rank system** — gamified browsing
- 🕵️ **Private tabs** — separate incognito sessions
- 📑 **Tab management** — swipe to close, gestures
- 🔖 **Bookmarks** with folders
- 📜 **History** with search
- ⚙️ **Settings** — search engine, theme, privacy toggles
- 👤 **Profile** with animated rank progress

---

## 🔧 Tech Stack

| Library | Version | Use |
|---|---|---|
| `expo` | ~52 | Build system |
| `react-native` | 0.76 | Core framework |
| `react-native-reanimated` | ~3 | Animations |
| `react-native-gesture-handler` | ~2 | Gestures |
| `expo-blur` | ~14 | Glassmorphism |
| `expo-linear-gradient` | ~14 | Gradients |
| `react-native-svg` | ~15 | SVG icons & logo |
| `react-native-webview` | ~13 | Browser engine |
| `zustand` | ^5 | State management |
| `@supabase/supabase-js` | ^2 | Backend + realtime |
| `lucide-react-native` | ^0.4 | Icons |
| `moti` | ^0.3 | Motion utilities |

---

## 🚀 Deploy

```bash
# Android APK
npx expo build:android

# iOS
npx expo build:ios

# EAS Build (recommended)
npm install -g eas-cli
eas build --platform android
```
