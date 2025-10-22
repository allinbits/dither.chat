# Dither Bot Development Setup

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd packages/bot
pnpm install
```

### 2. Environment Variables

Copy the `bot.env` file to `.env.local`:

```bash
cp bot.env .env.local
```

Or create a `.env.local` file with the following variables:

```bash
# Environment Configuration
ENVIRONMENT_TYPE=testnet

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8363885180:AAFPOk1LW0ytaulJBgXZhHJWEUwJoBr_1Bc
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Dither API Configuration (matching frontend-main)
VITE_API_ROOT_DEVNET=https://dither-staging.stuyk.com/v1
VITE_EXPLORER_URL_DEVNET=https://testnet.explorer.allinbits.services/atomone-devnet-1/tx
VITE_COMMUNITY_WALLET_DEVNET=atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep

VITE_API_ROOT_TESTNET=https://api.testnet.dither.chat/v1
VITE_EXPLORER_URL_TESTNET=https://testnet.explorer.allinbits.services/atomone-testnet-1/tx
VITE_COMMUNITY_WALLET_TESTNET=atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep

VITE_API_ROOT_MAINNET=https://api.mainnet.dither.chat/v1
VITE_EXPLORER_URL_MAINNET=https://www.mintscan.io/atomone/tx
VITE_COMMUNITY_WALLET_MAINNET=atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep

# Development Configuration
VITE_DEBUG=true
VITE_MOCK_API=false

# TON Connect Configuration
VITE_TONCONNECT_MANIFEST_URL=https://your-domain.com/tonconnect-manifest.json

# Cosmos/AtomOne Configuration
VITE_ATOMONE_RPC_URL=https://rpc.atomone.xyz
VITE_ATOMONE_CHAIN_ID=atomone_1
VITE_PHOTON_DENOM=uphoton
```

### 3. Start Development Server

```bash
pnpm run dev
```

## 🔧 Environment Variables Explained

### Required for Development

- **`VITE_DITHER_API_URL`**: URL of the Dither API backend
- **`VITE_DEBUG`**: Enable debug mode for development
- **`VITE_MOCK_API`**: Use mock data instead of real API (for testing)

### Optional for Development

- **`VITE_TONCONNECT_MANIFEST_URL`**: TON Connect manifest URL
- **`VITE_ATOMONE_RPC_URL`**: AtomOne RPC endpoint
- **`VITE_ATOMONE_CHAIN_ID`**: AtomOne chain ID
- **`VITE_PHOTON_DENOM`**: PHOTON token denomination

### Production Variables

- **`TELEGRAM_BOT_TOKEN`**: Telegram bot token (for production)
- **`TELEGRAM_WEBHOOK_URL`**: Webhook URL for Telegram bot

## 🛠️ Development Features

### Current Implementation

- ✅ **Vue 3 + TypeScript**: Modern reactive framework
- ✅ **Tailwind CSS v4**: Utility-first styling
- ✅ **shadcn/ui**: Component library
- ✅ **TMA.js**: Telegram Mini App SDK
- ✅ **TON Connect**: TON wallet integration
- ✅ **Vite**: Fast development server

### Available Pages

- **Home** (`/`): Welcome page with navigation
- **Feed** (`/feed`): Global post feed
- **Search** (`/search`): Content search
- **User** (`/user/:address`): User profiles
- **TON Connect** (`/ton-connect`): Wallet connection
- **Dev Tools**: Init data, theme params, launch params

### API Integration

- **Dither API**: Full CRUD operations
- **Feed Management**: Pagination and loading
- **Post Interactions**: Like, dislike, reply
- **Search**: Content discovery
- **User Management**: Profiles and statistics

## 🎨 Styling System

### Tailwind CSS v4

- **CSS Variables**: Theme system with light/dark mode
- **Responsive Design**: Mobile-first approach
- **Component Variants**: shadcn/ui components
- **Custom Breakpoints**: Optimized for mobile

### Available Components

- **Button**: Multiple variants and sizes
- **Card**: Container components
- **PostCard**: Rich post display
- **AppPage**: Base page wrapper

## 🔐 Wallet Integration

### TON Connect

- **Wallet Connection**: TON wallet integration
- **Transaction Signing**: Ready for blockchain interactions
- **Multi-Wallet Support**: Various TON wallets

### Cosmos Wallets (Planned)

- **Keplr**: Most popular Cosmos wallet
- **Leap**: Modern wallet with excellent UX
- **Cosmostation**: Feature-rich wallet

## 📱 Telegram Integration

### TMA.js Features

- **Theme Detection**: Automatic light/dark mode
- **Back Button**: Native Telegram navigation
- **Launch Parameters**: Access to Telegram data
- **Platform Detection**: iOS, Android, Desktop

### Development

- **Mock Environment**: Works outside Telegram
- **Debug Mode**: Enhanced logging
- **Hot Reload**: Fast development cycle

## 🚀 Deployment

### Development

```bash
pnpm run dev
```

### Production Build

```bash
pnpm run build
```

### Preview

```bash
pnpm run preview
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all UI components are properly exported
2. **API Errors**: Check if `VITE_DITHER_API_URL` is set correctly
3. **Wallet Errors**: Ensure TON Connect manifest is accessible
4. **Build Errors**: Run `pnpm run type-check` to verify TypeScript

### Debug Mode

Set `VITE_DEBUG=true` to enable:

- Enhanced error logging
- Development tools
- Mock data options

## 📚 Next Steps

1. **API Integration**: Connect to actual Dither backend
2. **Mock Data**: Add development mock data
3. **Testing**: Implement unit and integration tests
4. **Deployment**: Configure production deployment
5. **Features**: Add more Dither functionality

## 🎯 Ready to Develop!

Your development environment is now fully configured with:

- ✅ Modern Vue 3 + TypeScript setup
- ✅ Tailwind CSS + shadcn/ui styling
- ✅ Telegram Mini App integration
- ✅ Wallet connection capabilities
- ✅ API integration framework
- ✅ Development server running

Start building the Dither Telegram Mini App! 🚀
