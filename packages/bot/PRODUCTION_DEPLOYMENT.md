# Production Deployment Guide

## 🚀 **Deploy to Real Telegram Bot (No Mock Environment)**

### **Step 1: Telegram Bot Setup**

#### **1.1 Create Bot with BotFather**

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow the prompts to create your bot
4. Save your bot token: `8363885180:AAFPOk1LW0ytaulJBgXZhHJWEUwJoBr_1Bc`

#### **1.2 Create Mini App**

1. Use `/newapp` command in BotFather
2. Select your bot
3. Enter app title: "Dither Bot"
4. Enter app description: "Decentralized social network for Telegram"
5. Upload app icon (use your favicon.svg)
6. **Don't set the URL yet** - we'll do this after deployment

### **Step 2: Deploy Your App**

#### **Option A: Mate Hosting (Recommended)**

```bash
# 1. Build your app
pnpm run build

# 2. Get deployment info (first time only)
pnpm run deploy:telegram:info

# 3. Deploy to Mate hosting
pnpm run deploy:telegram
```

After deployment, you'll get a URL like: `https://your-storage-key.tapps.global/latest/`

#### **Option B: Your Own Hosting**

```bash
# 1. Build your app
pnpm run build

# 2. Deploy to your hosting service
# Examples:
# - Vercel: vercel deploy
# - Netlify: netlify deploy --prod
# - GitHub Pages: pnpm run deploy
```

### **Step 3: Configure Telegram Bot**

#### **3.1 Set Web App URL**

1. In BotFather, use `/setmenubutton` command
2. Select your bot
3. Set the URL to your deployed app (e.g., `https://your-storage-key.tapps.global/latest/`)
4. Set button text: "Open Dither"

#### **3.2 Set Bot Commands**

Use `/setcommands` in BotFather:

```
start - Start using Dither Bot
help - Get help and information
```

#### **3.3 Set Bot Description**

Use `/setdescription` in BotFather:

```
Dither Bot - Access the decentralized social network through Telegram. Browse posts, search content, and interact with the community.
```

### **Step 4: Test Your Bot**

1. **Find your bot** on Telegram (search for your bot username)
2. **Send `/start`** to your bot
3. **Click the menu button** to open your Mini App
4. **Test all features** in the real Telegram environment

### **Step 5: Production Environment Variables**

Create a `.env.production` file:

```bash
# Production Environment
ENVIRONMENT_TYPE=mainnet

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8363885180:AAFPOk1LW0ytaulJBgXZhHJWEUwJoBr_1Bc
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Dither API Configuration (Production)
VITE_API_ROOT_MAINNET=https://api.mainnet.dither.chat/v1
VITE_EXPLORER_URL_MAINNET=https://www.mintscan.io/atomone/tx
VITE_COMMUNITY_WALLET_MAINNET=atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep

# TON Connect Configuration
VITE_TONCONNECT_MANIFEST_URL=https://your-domain.com/tonconnect-manifest.json

# Cosmos/AtomOne Configuration
VITE_ATOMONE_RPC_URL=https://rpc.atomone.xyz
VITE_ATOMONE_CHAIN_ID=atomone_1
VITE_PHOTON_DENOM=uphoton
```

### **Step 6: Build for Production**

```bash
# Set production environment
export NODE_ENV=production

# Build with production config
pnpm run build

# Deploy
pnpm run deploy:telegram
```

## 🎯 **What Happens in Production**

### **No Mock Environment**

- ✅ **Real Telegram WebApp**: Uses actual Telegram APIs
- ✅ **Real Launch Parameters**: Gets real user data from Telegram
- ✅ **Real Theme**: Uses user's Telegram theme
- ✅ **Real Platform**: Detects actual device (iOS, Android, Desktop)

### **Real User Experience**

- ✅ **User Authentication**: Real Telegram user data
- ✅ **Theme Integration**: Matches user's Telegram theme
- ✅ **Device Optimization**: Optimized for user's device
- ✅ **Native Features**: Back button, main button, haptic feedback

## 🚀 **Deployment Checklist**

- [ ] Bot created with BotFather
- [ ] Mini App created with BotFather
- [ ] App built for production (`pnpm run build`)
- [ ] App deployed to hosting service
- [ ] Web App URL set in BotFather
- [ ] Bot commands configured
- [ ] Bot description set
- [ ] Production environment variables configured
- [ ] App tested in real Telegram environment

## 🎉 **Ready for Production!**

Your Dither Telegram Bot will now work as a real Telegram Mini App with:

- ✅ **No mock environment** in production
- ✅ **Real Telegram integration**
- ✅ **Professional deployment**
- ✅ **Real user experience**

**Your app is ready for real users!** 🚀
