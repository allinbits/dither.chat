# 🌐 Dither.chat Frontend

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Cosmos](https://img.shields.io/badge/Cosmos-AtomOne-2E3148?style=flat-square&logo=cosmos)](https://cosmos.network/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> 🚀 **A modern Vue 3 frontend for the Dither protocol** - a decentralized social media platform built for Cosmos chains (specifically AtomOne). This is the reference implementation of the Dither client, providing a complete social networking experience with blockchain-powered interactions.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](./ARCHITECTURE.md)
- [🎨 Design System](#-design-system)
- [🚦 Development](#-development)
- [🌐 Environment Support](#-environment-support)
- [📱 Responsive Design](#-responsive-design)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [📚 Learn More](#-learn-more)

## 🚀 Quick Start

### Prerequisites

<details>
<summary>📋 <strong>System Requirements</strong></summary>

- **Node.js** 18+ and **pnpm**
- **PHOTON tokens** on AtomOne network
- **Cosmos wallet** (Keplr, Leap, or Cosmostation)

</details>

> ⚠️ **Note**: You'll need PHOTON tokens for posting (minimum 0.000001 PHOTON per post)

### Development Setup

<details>
<summary>🛠️ <strong>Local Development</strong></summary>

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

</details>

### Full Stack Development

<details>
<summary>🏗️ <strong>Complete Stack with Tilt</strong></summary>

To run the complete Dither service with all components:

```bash
# Install Tilt (https://tilt.dev)
tilt up
# Visit http://localhost:10350/ for Tilt dashboard
```

**Available Services:**

- 🌐 Frontend: `http://localhost:5173`
- 🚀 API: `http://localhost:3000`
- 📖 Reader: `http://localhost:3001`
- 🗄️ Database: `http://localhost:5432`

</details>

### Technology Highlights

| Category          | Technology                 | Purpose                                    |
| ----------------- | -------------------------- | ------------------------------------------ |
| **🎨 Frontend**   | Vue 3 + TypeScript         | Modern reactive framework with type safety |
| **🎨 Styling**    | Tailwind CSS 4 + shadcn/ui | Utility-first CSS with component library   |
| **📊 State**      | Pinia + TanStack Query     | Global state + server state management     |
| **⛓️ Blockchain** | CosmJS                     | Cosmos blockchain integration              |
| **💼 Wallets**    | Keplr, Leap, Cosmostation  | Multi-wallet support                       |
| **🛠️ Build**      | Vite                       | Fast development and build tooling         |
| **🧪 Testing**    | Vitest                     | Modern testing framework                   |

## 🏗️ Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🎨 Design System

- **shadcn/ui** components with custom theming
- **Dark/light mode** support
- **Responsive breakpoints** for mobile, tablet, desktop
- **Consistent spacing** and typography
- **Accessible** components with proper ARIA labels

## 🚦 Development

### Code Style

<details>
<summary>📝 <strong>Development Standards</strong></summary>

- **TypeScript** strict mode
- **Composition API** with `<script setup>`
- **4-space indentation** with Prettier
- **ESLint** for code quality
- **Component composition** over inheritance

</details>

### State Management

<details>
<summary>📊 <strong>State Architecture</strong></summary>

- **Pinia** for global state (wallet, config, filters)
- **TanStack Query** for server state and caching
- **Optimistic updates** for better UX
- **Session persistence** for user preferences

</details>

### Performance

<details>
<summary>⚡ <strong>Optimization Strategies</strong></summary>

- **Infinite scrolling** with pagination
- **Lazy loading** of components
- **Bundle optimization** with tree shaking
- **Efficient re-rendering** with proper keys

</details>

## 🌐 Environment Support

<details>
<summary>🌍 <strong>Network Environments</strong></summary>

| Environment    | Network            | Purpose                | Status    |
| -------------- | ------------------ | ---------------------- | --------- |
| **🌐 Mainnet** | AtomOne Production | Live platform          | ✅ Active |
| **🧪 Testnet** | AtomOne Testnet    | Development & testing  | ✅ Active |
| **🏠 Devnet**  | Local development  | Full stack development | ✅ Active |

</details>

## 📱 Responsive Design

<details>
<summary>📱 <strong>Mobile-First Approach</strong></summary>

- **Mobile-first** approach
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions
- **Optimized performance** on mobile devices

</details>

## 🔒 Security

<details>
<summary>🛡️ <strong>Security Measures</strong></summary>

- **Input sanitization** and XSS prevention
- **Secure wallet** integration
- **Transaction validation**
- **Rate limiting** handling

</details>

## 🧪 Testing

<details>
<summary>🧪 <strong>Testing Strategy</strong></summary>

- **Component testing** with Vue Test Utils
- **Integration testing** for API interactions
- **Wallet connection** testing
- **Cross-browser** compatibility

</details>

## 📚 Learn More

### Dither Protocol

<details>
<summary>📖 <strong>Protocol Documentation</strong></summary>

- [Dither Protocol Documentation](./docs/guides/protocol.md)
- [Usage Guide](./docs/guides/usage.md)
- [About Dither](./docs/README.md)

</details>

### Development Resources

<details>
<summary>🛠️ <strong>External Resources</strong></summary>

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TanStack Query](https://tanstack.com/query/latest)
- [CosmJS Documentation](https://cosmos.github.io/cosmjs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

</details>

### Related Packages

<details>
<summary>📦 <strong>Dither Ecosystem</strong></summary>

- [API Main](../api-main/README.md) - REST API backend
- [Reader Main](../reader-main/README.md) - Blockchain reader service
- [CLI](../cli/README.md) - Command-line tools

</details>

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/your-org/dither.chat)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/dither)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/dither_chat)

</div>
