# Dither.chat Frontend

A modern Vue 3 frontend for the Dither protocol - a decentralized social media platform built for Cosmos chains (specifically AtomOne). This is the reference implementation of the Dither client, providing a complete social networking experience with blockchain-powered interactions.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **PHOTON tokens** on AtomOne network
- **Cosmos wallet** (Keplr, Leap, or Cosmostation)

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Full Stack Development

To run the complete Dither service with all components:

```bash
# Install Tilt (https://tilt.dev)
tilt up
# Visit http://localhost:10350/ for Tilt dashboard
```

## 🛠️ Tech Stack

- **Vue 3** + TypeScript + Vite
- **Tailwind CSS 4** + shadcn/ui components
- **Pinia** + TanStack Query for state management
- **CosmJS** for blockchain integration
- **Multi-wallet support** (Keplr, Leap, Cosmostation)

## 🏗️ Architecture

### Dither Protocol Integration

This frontend is part of the larger Dither ecosystem:

- **Frontend** (this package) - Vue 3 SPA for user interactions
- **API Main** - REST API serving post feeds and user data
- **Reader Main** - Blockchain reader parsing `dither.*` memos
- **CLI** - Command-line tool for extracting dither messages

### Core Features

- **Blockchain-first**: All actions go through Cosmos transactions via memos
- **Event-sourced**: State rebuilt from blockchain events
- **Optimistic updates**: Instant UI feedback during blockchain operations
- **Multi-wallet**: Seamless wallet switching and connection
- **Real-time**: Live updates with infinite scrolling
- **Mobile-first**: Responsive design across all devices

### Project Structure

```
src/
├── components/     # UI components (posts, users, wallet, etc.)
├── composables/    # Business logic and state management
├── stores/         # Pinia stores with persistence
├── views/          # Page-level components
├── layouts/        # Responsive layout system
└── utility/        # Helper functions and utilities
```

## 🎨 Design System

- **shadcn/ui** components with custom theming
- **Dark/light mode** support
- **Responsive breakpoints** for mobile, tablet, desktop
- **Consistent spacing** and typography
- **Accessible** components with proper ARIA labels

## 🔗 Blockchain Integration

### Dither Protocol

All interactions use the Dither protocol via blockchain memos:

```typescript
// Post creation
dither.Post('Hello, Dither!');

// Reply to post
dither.Reply('0xabc123...', 'Great post!');

// Social interactions
dither.Like('0xdef456...');
dither.Follow('cosmos1user...');
```

### Supported Wallets

- **Keplr** - Most popular Cosmos wallet
- **Leap** - Modern wallet with great UX
- **Cosmostation** - Feature-rich wallet
- **Address-only** - For read-only access

### Key Features

- **Post creation** with PHOTON token staking (minimum 0.000001 PHOTON)
- **Like/dislike** system with token burning
- **Follow/unfollow** functionality
- **Reply threading** with nested conversations
- **User tipping** and social interactions
- **Content moderation** through flagging system

## 🚦 Development

### Code Style

- **TypeScript** strict mode
- **Composition API** with `<script setup>`
- **4-space indentation** with Prettier
- **ESLint** for code quality
- **Component composition** over inheritance

### State Management

- **Pinia** for global state (wallet, config, filters)
- **TanStack Query** for server state and caching
- **Optimistic updates** for better UX
- **Session persistence** for user preferences

### Performance

- **Infinite scrolling** with pagination
- **Lazy loading** of components
- **Bundle optimization** with tree shaking
- **Efficient re-rendering** with proper keys

## 🌐 Environment Support

- **Mainnet** - Production AtomOne network
- **Testnet** - Development and testing on AtomOne testnet
- **Devnet** - Local development with full stack

## 📱 Responsive Design

- **Mobile-first** approach
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions
- **Optimized performance** on mobile devices

## 🔒 Security

- **Input sanitization** and XSS prevention
- **Secure wallet** integration
- **Transaction validation**
- **Rate limiting** handling

## 🧪 Testing

- **Component testing** with Vue Test Utils
- **Integration testing** for API interactions
- **Wallet connection** testing
- **Cross-browser** compatibility

## 📚 Learn More

### Dither Protocol

- [Dither Protocol Documentation](./docs/guides/protocol.md)
- [Usage Guide](./docs/guides/usage.md)
- [About Dither](./docs/README.md)

### Development Resources

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TanStack Query](https://tanstack.com/query/latest)
- [CosmJS Documentation](https://cosmos.github.io/cosmjs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Related Packages

- [API Main](../api-main/README.md) - REST API backend
- [Reader Main](../reader-main/README.md) - Blockchain reader service
- [CLI](../cli/README.md) - Command-line tools
