# Telegram Mini App Development Guide

## 🎯 **Proper Development Setup**

Based on the official [TMA.js SDK usage tips](https://docs.telegram-mini-apps.com/packages/tma-js-sdk/usage-tips) and [@telegram-apps/mate documentation](https://docs.telegram-mini-apps.com/packages/telegram-apps-mate), here's the correct way to develop Telegram Mini Apps.

## 🚀 **Development Options**

### **Option A: Standard Development (Browser)**

```bash
pnpm run dev
```

- **Simple browser testing**
- **Basic Telegram WebApp mock**
- **Fast development cycle**

### **Option B: HTTPS Development (Recommended for Telegram)**

```bash
pnpm run dev:https
```

- **HTTPS Required**: Telegram Mini Apps require HTTPS
- **Real Telegram Environment**: Works with actual Telegram WebApp
- **Theme Testing**: Light/dark mode switching
- **Device Simulation**: Different device types and screen sizes
- **Launch Parameters**: Test various Telegram launch scenarios

## 🔧 **TMA.js SDK Best Practices**

### **1. Proper Initialization**

According to the [usage tips](https://docs.telegram-mini-apps.com/packages/tma-js-sdk/usage-tips), the SDK must be initialized before using any components:

```typescript
import { init } from "@tma.js/sdk-vue";

// Initialize the SDK
init();
```

### **2. Component Mounting**

Components must be mounted before using their methods:

```typescript
import { backButton } from "@tma.js/sdk-vue";

// Mount the component first
backButton.mount();

// Then use its methods
backButton.show();
```

### **3. Availability Checks**

Always check if methods are available before calling them:

```typescript
import { backButton } from "@tma.js/sdk-vue";

// Check availability before using
if (backButton.show.isAvailable()) {
  backButton.show();
}

// Or use the ifAvailable method
backButton.show.ifAvailable();
```

## 🛠️ **Our Implementation**

Our current setup follows these best practices:

### **SDK Initialization** (`src/init.ts`)

```typescript
// Proper initialization with error handling
try {
  setDebug(options.debug);
  initSDK();
} catch (error) {
  console.warn("TMA SDK initialization failed:", error);
}

// Component mounting with availability checks
try {
  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }
} catch (error) {
  console.warn("TMA SDK component mounting failed:", error);
}
```

### **Mock Environment** (`src/mockEnv.ts`)

```typescript
// Simple development environment setup
if (import.meta.env.DEV) {
  if (typeof window !== "undefined" && !window.Telegram?.WebApp) {
    window.Telegram = {
      WebApp: {
        // Minimal mock implementation
        initData: "",
        initDataUnsafe: { user: { id: 1, first_name: "Test" } },
        version: "8.4",
        platform: "tdesktop",
        colorScheme: "dark",
        // ... other properties
      },
    };
  }
}
```

## 🚀 **Deployment with Mate Hosting**

### **1. Create Project**

Contact [@tma_mate_bot](https://t.me/tma_mate_bot) to create a project and get your deployment token.

### **2. Update Configuration**

Update `mate.yml` with your project details:

```yaml
deploy:
  projectId: YOUR_PROJECT_ID
  token: YOUR_DEPLOYMENT_TOKEN
  directory: dist
  tag: latest
```

### **3. Deploy**

#### **Step 1: Get Project Info**

```bash
pnpm run deploy:telegram:info
```

#### **Step 2: Deploy**

```bash
pnpm run deploy:telegram
```

According to the [Mate hosting documentation](https://docs.telegram-mini-apps.com/packages/telegram-apps-mate/hosting), this provides:

- **Free Hosting**: No cost for static assets
- **CDN**: Global content delivery network
- **Version Management**: Up to 5 deployment tags
- **Fast Deployment**: Optimized for Telegram Mini Apps

## 📱 **Development Workflow**

### **1. Start Development**

```bash
# For Telegram-specific development (HTTPS required)
pnpm run dev:https

# For standard browser development
pnpm run dev
```

### **2. Test Features**

- **Theme Switching**: Test light/dark mode
- **Device Simulation**: Test different screen sizes
- **Launch Parameters**: Test various Telegram scenarios
- **Component Availability**: Test TMA.js components

### **3. Build and Deploy**

```bash
# Build for production
pnpm run build

# Get deployment info (first time setup)
pnpm run deploy:telegram:info

# Deploy to Mate hosting
pnpm run deploy:telegram
```

## ✅ **Key Benefits**

1. **Proper SDK Usage**: Follows official TMA.js best practices
2. **Error Handling**: Graceful degradation when SDK fails
3. **Development Tools**: Enhanced debugging with Mate
4. **Free Hosting**: Professional deployment with Mate
5. **Type Safety**: Full TypeScript support
6. **Modern Stack**: Vue 3, Tailwind CSS, shadcn/ui

## 🎯 **Ready for Production**

Your Dither Telegram Bot now has:

- ✅ **Proper TMA.js SDK initialization**
- ✅ **Component mounting with availability checks**
- ✅ **Error handling and graceful degradation**
- ✅ **Development tools with Mate**
- ✅ **Free hosting deployment**
- ✅ **Modern UI with Tailwind + shadcn/ui**

**Your Telegram Mini App is ready for development and deployment!** 🎉
