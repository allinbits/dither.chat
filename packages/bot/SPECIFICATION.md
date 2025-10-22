# Dither Telegram Bot Specification

## Executive Summary

A comprehensive Telegram bot that provides seamless access to the Dither decentralized social network. The bot enables Telegram users to read feeds, interact with posts, and participate in the blockchain-based social protocol without requiring web wallets or complex setup.

**Key Value Propositions:**

- **Accessibility**: Bring Dither to Telegram's 800M+ users
- **Simplicity**: No web wallet complexity for basic interactions
- **Integration**: Native Telegram experience with blockchain power
- **Onboarding**: Gateway for new users to discover Dither

## Target Audience & Use Cases

### Primary Users

- **Telegram Desktop Users**: Power users who prefer Telegram's interface
- **Mobile-First Users**: Users who primarily use Telegram on mobile
- **Blockchain Curious**: Users interested in decentralized social networks
- **Existing Dither Users**: Convenient access via Telegram

### Use Cases

1. **Discovery**: Browse Dither content without technical barriers
2. **Engagement**: Like, reply, and follow users through familiar interface
3. **Onboarding**: Learn about Dither protocol through guided experience
4. **Convenience**: Access Dither content while using Telegram

## Security & Trust

!!! **Critical Security Notice**

- **Never share private keys or mnemonic phrases**
- **Bot never requests sensitive wallet information**
- **All transactions require explicit user approval**
- **Wallet connections use standard Cosmos protocols**
  !!!

## Core Features

### 📱 Feed Management

- **Global Feed**: Latest posts from entire Dither network
- **Following Feed**: Posts from users you follow (authenticated)
- **User Feeds**: Posts from specific users
- **Search**: Find posts by content, author, or hashtags
- **Trending**: Popular posts and topics

### 💬 Social Interactions

- **Post Viewing**: Full post content with metadata
- **Reply Threading**: Nested conversation views
- **Like/Dislike**: Express sentiment on posts
- **Follow/Unfollow**: Manage social connections
- **Flag Content**: Report inappropriate content

### 🔐 Authentication & Wallets

- **Multi-Wallet Support**: Keplr, Leap, Cosmostation
- **Secure Connection**: Message signing for authentication
- **Address Management**: Multiple wallet support
- **Read-Only Mode**: Browse without wallet connection

## Dither Protocol Integration

### Protocol Fundamentals

The Dither protocol operates through blockchain memos with strict constraints:

- **Content Limit**: 512 bytes maximum per message
- **Minimum Stake**: 0.000001 PHOTON per transaction
- **Protocol Address**: `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep`
- **Network**: AtomOne (Cosmos-based)

### Supported Actions

#### Content Creation

```typescript
dither.Post("Your message here"); // Create new post
dither.Reply("0xhash...", "Reply text"); // Reply to post
dither.Remove("0xhash..."); // Remove own post
```

#### Social Interactions

```typescript
dither.Like("0xhash..."); // Like a post
dither.Dislike("0xhash..."); // Dislike a post
dither.Flag("0xhash..."); // Flag content
```

#### User Management

```typescript
dither.Follow("cosmos1address..."); // Follow user
dither.Unfollow("cosmos1address..."); // Unfollow user
```

### Transaction Architecture

- **Type**: Bank transfers with memo field
- **Amount**: Minimum 0.000001 PHOTON + gas fees
- **Memo Format**: `dither.Action("parameters")`
- **Validation**: Strict memo format enforcement
- **Security**: User signature required for all transactions

## Technical Architecture

### System Overview

```mermaid
graph TB
    subgraph "User Interface"
        TG[Telegram Bot]
        TMA[Telegram Mini App]
        UI[React Components]
    end

    subgraph "Bot Backend"
        API[ElysiaJS API]
        AUTH[JWT Authentication]
        CACHE[Redis Cache]
        DB[(PostgreSQL)]
    end

    subgraph "Dither Ecosystem"
        DAPI[Dither API]
        READER[Blockchain Reader]
        BC[AtomOne Network]
    end

    subgraph "Wallet Layer"
        WALLET[Wallet Connect]
        SIGN[Transaction Signing]
        TX[Blockchain TX]
    end

    TG --> API
    TMA --> UI
    UI --> API
    API --> AUTH
    API --> CACHE
    API --> DB
    API --> DAPI
    DAPI --> READER
    READER --> BC
    API --> WALLET
    WALLET --> SIGN
    SIGN --> TX
    TX --> BC
```

### Technology Stack

#### Backend Services

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: ElysiaJS (matching API Main)
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis for session and response caching
- **Queue**: BullMQ for background processing
- **Package Manager**: pnpm

#### Frontend (Mini App)

- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **State**: TanStack Query + Zustand
- **Build**: Vite with TypeScript

#### Blockchain Integration

- **Network**: AtomOne (Cosmos SDK)
- **Wallets**: Keplr, Leap, Cosmostation SDKs
- **Transactions**: CosmJS for transaction building
- **RPC**: AtomOne RPC endpoints

## User Experience Design

### Telegram Bot Interface

#### Command Structure

```
/start          - Welcome and onboarding
/help           - Command reference
/feed           - Global feed (10 posts)
/search <query> - Search posts
/user <addr>    - User profile
/post <hash>    - Specific post
/connect        - Wallet connection
/settings      - User preferences
```

#### Interactive Menus

**Main Navigation:**

```
[🏠 Feed] [👥 Following] [🔍 Search] [👤 Profile] [⚙️ Settings]
```

**Post Actions:**

```
[👍 Like] [👎 Dislike] [💬 Reply] [🚩 Flag] [👤 Author] [🔗 Share]
```

**User Actions:**

```
[👤 Follow] [📊 Stats] [📝 Posts] [🔗 Profile]
```

### Mini App Interface

#### Layout Design

```
┌─────────────────────────────────┐
│ 🏠 Dither Bot    🔗 Wallet     │
├─────────────────────────────────┤
│ [Feed] [Following] [Search] [Me]│
├─────────────────────────────────┤
│                                 │
│  📝 Post Content                │
│  👤 @username • 2h ago          │
│  👍 5 • 💬 3 • 🔗 abc123...    │
│                                 │
│  📝 Another Post                │
│  👤 @user2 • 1h ago             │
│  👍 12 • 💬 1 • 🔗 def456...   │
│                                 │
├─────────────────────────────────┤
│ 💎 0.001 PHOTON • 🔗 Connected  │
└─────────────────────────────────┘
```

#### Key Components

- **PostCard**: Rich post display with interactions
- **UserProfile**: Comprehensive user information
- **WalletConnect**: Secure wallet integration
- **TransactionModal**: Transaction signing interface
- **SearchResults**: Advanced search with filters

## API Integration

### Dither API Endpoints

#### Read Operations (Public)

```typescript
GET / v1 / feed; // Global feed
GET / v1 / posts; // User posts
GET / v1 / post; // Specific post
GET / v1 / replies; // Post replies
GET / v1 / search; // Search posts
GET / v1 / following - posts; // Following feed
GET / v1 / followers; // User followers
GET / v1 / following; // User following
```

#### Write Operations (Authenticated)

```typescript
POST / v1 / post; // Create post
POST / v1 / reply; // Reply to post
POST / v1 / like; // Like post
POST / v1 / dislike; // Dislike post
POST / v1 / follow; // Follow user
POST / v1 / unfollow; // Unfollow user
POST / v1 / flag; // Flag content
```

### Authentication Flow

1. **Wallet Connection**: User connects Cosmos wallet
2. **Message Signing**: Sign authentication message
3. **JWT Generation**: Receive API access token
4. **Session Management**: Secure session handling
5. **Token Refresh**: Automatic token renewal

## User Requirements

### Prerequisites

1. **AtomOne Address**: Cosmos account on AtomOne network
2. **PHOTON Tokens**: Minimum 0.000001 PHOTON per transaction
3. **Wallet Extension**: Keplr, Leap, or Cosmostation
4. **Telegram Account**: Active Telegram account

### PHOTON Token Acquisition

- **Osmosis DEX**: [Trade for PHOTON](https://app.osmosis.zone/assets/PHOTON)
- **Minting**: [Mint from ATONE](https://cogwheel.zone/blog/how-to-mint-photon)
- **Purpose**: Covers indexing costs and validator fees

### Content Guidelines

- **Text Only**: No image uploads (link to external hosts)
- **512 Byte Limit**: Maximum content length
- **External Links**: Third-party image hosting allowed
- **Content Safety**: Prevents malicious content on-chain

## Bot Commands & Interactions

### Welcome Flow (`/start`)

```
🌐 Welcome to Dither Bot!

I help you access the Dither decentralized social network.

🚀 Quick Start:
• /feed - Browse latest posts
• /search <query> - Find content
• /connect - Link your wallet

💡 Need help? Use /help
```

### Feed Display (`/feed`)

```
📱 Latest Posts (10/100)

📝 "Just discovered Dither! This is amazing..."
👤 @alice • 2h ago • 💎 0.001 PHOTON
👍 5 • 💬 3 • 🔗 abc123...

[👍 Like] [👎 Dislike] [💬 Reply] [🚩 Flag]
[👤 Author] [🔗 Share] [📋 Copy Hash]

[Load More] [🏠 Home] [🔍 Search]
```

### User Profile (`/user <address>`)

```
👤 @alice
📍 cosmos1abc...def
📊 42 posts • 128 followers • 89 following
⏰ Joined 6 months ago

Recent Posts:
• "Working on a new project..."
• "Just finished reading..."
• "Amazing sunset today..."

[👤 Follow] [📊 Stats] [📝 Posts] [🔗 Profile]
```

### Search Results (`/search <query>`)

```
🔍 Search Results for "blockchain"

📝 "Understanding blockchain technology..."
👤 @bob • 1d ago • 💎 0.002 PHOTON
👍 12 • 💬 5 • 🔗 def456...

📝 "Blockchain vs traditional databases..."
👤 @charlie • 2d ago • 💎 0.001 PHOTON
👍 8 • 💬 2 • 🔗 ghi789...

[Load More] [🏠 Home] [🔍 New Search]
```

## Wallet Integration

### Supported Wallets

- **Keplr**: Most popular Cosmos wallet
- **Leap**: Modern wallet with excellent UX
- **Cosmostation**: Feature-rich wallet
- **Manual Address**: Read-only mode

### Connection Process

1. **Wallet Selection**: Choose from supported wallets
2. **Address Connection**: Connect to AtomOne address
3. **Authentication**: Sign message for verification
4. **Token Generation**: Receive JWT for API access
5. **Ready State**: Full interaction capabilities

### Transaction Flow

1. **User Action**: Like, reply, follow, etc.
2. **Transaction Building**: Create bank transfer with memo
3. **Wallet Signing**: User approves transaction
4. **Blockchain Submission**: Submit to AtomOne network
5. **Confirmation**: Update UI with results
6. **Indexing**: Blockchain reader processes memo

### Alternative Methods

For users without wallet extensions:

- **CLI Instructions**: Manual `atomoned` commands
- **Transaction Templates**: Pre-formatted transactions
- **Read-Only Access**: Browse without posting

## Message Formatting

### Post Display

```
📝 Post by @username
📍 cosmos1abc...def
⏰ 2 hours ago
💎 0.001 PHOTON

This is the post content that can be up to 512 characters long and supports basic formatting.

👍 5 likes | 💬 3 replies | 🔗 abc123...
```

### User Profile

```
👤 @username
📍 cosmos1abc...def
📊 42 posts | 128 followers | 89 following
⏰ Joined 6 months ago

Recent Posts:
• "Latest post content..."
• "Another post here..."
• "Third post example..."
```

### Notifications

```
🔔 New notification

@username liked your post:
"Post content preview..."

👀 View Post | 💬 Reply
```

## Error Handling & Recovery

### Error Categories

- **Authentication**: Wallet connection issues
- **Network**: API or blockchain connectivity
- **Validation**: Content or transaction errors
- **Rate Limiting**: API usage limits
- **User Input**: Invalid commands or parameters

### Error Messages

```
❌ Wallet Not Connected
Please connect your wallet first using /connect

❌ Insufficient Funds
You need at least 0.000001 PHOTON for this transaction

❌ Content Too Long
Message exceeds 512 byte limit. Please shorten your message.

❌ Network Error
Unable to connect to Dither network. Please try again.

❌ Transaction Failed
Blockchain transaction failed. Please retry.
```

### Recovery Strategies

- **Automatic Retry**: Exponential backoff for transient errors
- **Fallback Data**: Show cached content when API unavailable
- **Manual Instructions**: CLI commands for wallet issues
- **Graceful Degradation**: Read-only mode when posting fails

## Security Implementation

### Data Protection

- **No Private Keys**: Bot never stores private keys
- **Encrypted Storage**: Wallet addresses encrypted at rest
- **Session Security**: JWT tokens with expiration
- **Rate Limiting**: Prevent abuse and spam

### Transaction Security

- **User Approval**: All transactions require explicit approval
- **Memo Validation**: Strict format validation
- **Amount Limits**: Enforce minimum transaction amounts
- **Address Verification**: Confirm wallet ownership

### Privacy Considerations

- **Data Minimization**: Store only necessary user data
- **Secure Communication**: HTTPS for all API calls
- **Session Management**: Secure token handling
- **Audit Logging**: Track security events

## Performance Optimization

### Caching Strategy

- **Feed Cache**: 5-minute TTL for popular posts
- **User Cache**: 10-minute TTL for user profiles
- **Search Cache**: 2-minute TTL for search results
- **API Cache**: Response caching with appropriate TTL

### Database Optimization

- **Indexing**: Optimized database indexes
- **Query Optimization**: Efficient database queries
- **Connection Pooling**: Database connection management
- **Read Replicas**: Separate read/write operations

### API Performance

- **Response Time**: <2 seconds for feed loading
- **Pagination**: Efficient data loading
- **Compression**: Response compression
- **CDN**: Static asset delivery

## Deployment Architecture

### Environment Configuration

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Dither API
DITHER_API_URL=https://api.dither.chat/v1
DITHER_API_AUTH=your_api_auth_token

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/db

# Blockchain
ATOMONE_RPC_URL=https://rpc.atomone.xyz
ATOMONE_CHAIN_ID=atomone_1
PHOTON_DENOM=uphoton

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Infrastructure Requirements

- **Server**: Node.js 20+ runtime
- **Database**: PostgreSQL 14+ with connection pooling
- **Cache**: Redis 6+ for session and response caching
- **Storage**: Encrypted storage for user data
- **Monitoring**: Application and infrastructure monitoring

### Scaling Considerations

- **Horizontal Scaling**: Multiple bot instances
- **Database Scaling**: Read replicas and connection pooling
- **Cache Scaling**: Redis cluster for high availability
- **Load Balancing**: Distribute traffic across instances

## Development Roadmap

### Phase 1: MVP (4-6 weeks)

- [ ] Bot setup and basic commands
- [ ] Feed reading functionality
- [ ] Post viewing and search
- [ ] Basic error handling
- [ ] User authentication flow

### Phase 2: Interaction (4-6 weeks)

- [ ] Wallet connection integration
- [ ] Mini App development
- [ ] Transaction signing
- [ ] Like/dislike functionality
- [ ] Reply system

### Phase 3: Social Features (4-6 weeks)

- [ ] Follow/unfollow system
- [ ] User profiles
- [ ] Notifications
- [ ] Advanced search
- [ ] Content moderation

### Phase 4: Advanced Features (6-8 weeks)

- [ ] Push notifications
- [ ] Group integration
- [ ] Analytics dashboard
- [ ] Admin tools
- [ ] Performance optimization

## Success Metrics

### User Engagement

- **Daily Active Users**: 100+ users
- **Posts Read**: 10+ posts per session
- **Interactions**: 5+ likes/replies per user
- **Retention**: 70%+ weekly retention
- **Conversion**: 20%+ wallet connection rate

### Technical Performance

- **Response Time**: <2 seconds for feed loading
- **Uptime**: 99.5%+ availability
- **Error Rate**: <1% failed requests
- **Cache Hit Rate**: 80%+ for popular content
- **Transaction Success**: 95%+ transaction success rate

### Business Impact

- **User Onboarding**: 50+ new Dither users
- **Content Creation**: 100+ posts via bot
- **Social Connections**: 200+ follow relationships
- **Network Growth**: 10%+ increase in Dither activity

## Frequently Asked Questions

### How does Dither work?

Dither uses blockchain memos to store social interactions. Posts are created by sending transactions with `dither.Post("message")` memos to the protocol address. The system indexes these transactions and provides a social media interface.

### Can I upload images?

No, Dither is text-only. You can link to external image hosts, but images aren't stored on-chain. This prevents malicious content and keeps the system lightweight.

### How do I post without a wallet?

You can use CLI tools like `atomoned` to send transactions manually, or use the bot's read-only mode to browse content without posting.

### Why does Dither cost PHOTON?

The small fee (0.000001 PHOTON) covers operational costs for indexing and network validator fees. This ensures the service remains sustainable while keeping costs minimal.

### Can messages be deleted?

No, blockchain data is immutable. However, Dither can hide messages from the interface while keeping them accessible on-chain.

## Future Enhancements

### Advanced Features

- **Push Notifications**: Real-time updates
- **Group Integration**: Share posts in Telegram groups
- **Voice Messages**: Audio post support
- **Cross-Platform**: Discord, Matrix integration
- **Mobile Apps**: Native mobile applications

### AI Integration

- **Content Moderation**: AI-powered content filtering
- **Recommendation Engine**: Personalized feed algorithms
- **Language Translation**: Multi-language support
- **Content Summarization**: Auto-generated summaries
- **Sentiment Analysis**: Post sentiment tracking

### Blockchain Features

- **NFT Integration**: Profile pictures and achievements
- **Token Rewards**: PHOTON rewards for engagement
- **Governance**: Voting on protocol changes
- **Cross-Chain**: Multi-chain support
- **Layer 2**: Scaling solutions

## Conclusion

The Dither Telegram Bot represents a significant opportunity to bring decentralized social networking to a mainstream audience. By leveraging Telegram's familiar interface and user base, we can onboard millions of users to the Dither protocol while maintaining the security and decentralization that makes it valuable.

The bot serves multiple purposes:

- **Gateway**: Onboard new users to Dither
- **Convenience**: Provide easy access for existing users
- **Education**: Teach users about decentralized social networks
- **Growth**: Expand the Dither ecosystem

This specification provides a comprehensive roadmap for building a production-ready Telegram bot that seamlessly integrates with the Dither protocol while maintaining the highest standards of security, performance, and user experience.
