# 🔥 MUDDBRO NFT FORGE

**On-Chain Gear Marketplace • TON Testnet • Telegram Mini App**

A fully-functional NFT marketplace for MUDDBRO's Genesis Collection, built with Deno, TypeScript, and Telegram WebApp integration.

---

## 🎮 Features

✅ **Genesis Catalog** - 5 collectible items (Sun-Forged Crown, Lunar Staff, Void Blade, etc.)  
✅ **NFT Minting** - Burn MUDD tokens to mint gear  
✅ **Marketplace** - Buy/sell gear with automatic fee distribution  
✅ **User Vault** - Personal inventory management  
✅ **Wallet Linking** - Connect TON wallet addresses  
✅ **Telegram Integration** - Play directly in Telegram  
✅ **Real-Time Balance** - Track MUDD & ORE holdings  

---

## 📋 Quick Start

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/medinaderik26-design/Muddbro-Market
cd Muddbro-Market

# 2. Run locally
deno run --allow-net store.ts

# 3. Open browser
# → http://localhost:8000
```

### Deploy to Production

See **[deno-deploy.md](./deno-deploy.md)** for step-by-step deployment instructions.

**TL;DR:**
1. Go to https://dash.deno.com
2. Connect GitHub repo
3. Deploy (auto-generates URL like `https://muddbro-nft-store.deno.dev`)
4. Update frontend API URL
5. Done! 🚀

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  📱 Telegram Mini App (Frontend)        │
│  • muddbro--nft-store.html              │
│  • Pure JS/CSS, no dependencies         │
└──────────────┬──────────────────────────┘
               │ HTTPS POST/GET
               ↓
┌─────────────────────────────────────────┐
│  ⚙️ Deno Backend (API Server)           │
│  • store.ts                             │
│  • User Management                      │
│  • Minting Engine                       │
│  • Marketplace Logic                    │
└─────────────────────────────────────────┘
```

---

## 📡 API Endpoints

All endpoints accept POST requests with JSON body.

### User Management
- `identify` - Get user profile & balances
- `link_wallet` - Link TON wallet address

### Catalog
- `get_catalog` - Browse Genesis items
- `request_mint` - Mint gear with MUDD

### Inventory
- `get_vault` - View user's gear
- `list_gear` - List gear for sale
- `cancel_listing` - Remove listing

### Marketplace
- `get_market` - Browse all listings
- `buy_listing` - Purchase gear (5% fee applied)

**Example Request:**
```bash
curl -X POST https://muddbro-nft-store.deno.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "action": "identify",
    "telegram_id": "123456789",
    "username": "muddbro_hunter"
  }'
```

---

## 💾 Data Model

### User Profile
```typescript
{
  telegram_id: string;
  username: string;
  mudd_balance: number;
  mudd_ore_balance: number;
  ton_wallet_address?: string;
}
```

### Gear Item
```typescript
{
  id: string;
  owner_id: string;
  catalog_key: string;
  minted_at: number;
  on_chain: boolean;
}
```

### Marketplace Listing
```typescript
{
  id: string;
  gear_id: string;
  seller_id: string;
  price_mudd: number;
  created_at: number;
}
```

---

## ⚙️ Configuration

### Genesis Catalog (in `store.ts`)
```typescript
const CATALOG = [
  { key: "sun-forged-molten-crown", name: "Sun-Forged Molten Crown", mint_price: 1000, ... }
  // ... 4 more items
];
```

### Economics
- **Starting Balance**: 5000 MUDD, 100 ORE
- **Mint Prices**: 500-1000 MUDD per item
- **Marketplace Fee**: 5% (BPS 500)
- **Fee Distribution**: 95% to seller, 5% to house

---

## 🔧 Development

### Format Code
```bash
deno fmt store.ts
```

### Type Check
```bash
deno check store.ts
```

### Lint
```bash
deno lint store.ts
```

---

## 🔐 Security Notes

**Current State (Development):**
- ⚠️ In-memory storage (data resets on restart)
- ⚠️ No authentication required
- ⚠️ CORS set to `*`

**Production Requirements:**
- [ ] Implement persistent database (Deno KV or PostgreSQL)
- [ ] Add request signing/verification
- [ ] Enable authentication for sensitive operations
- [ ] Restrict CORS to specific origins
- [ ] Add rate limiting
- [ ] Implement audit logging

---

## 📦 Tech Stack

- **Runtime**: Deno 1.40+
- **Language**: TypeScript
- **Deployment**: Deno Deploy
- **Frontend**: Vanilla JS/HTML/CSS
- **Integration**: Telegram WebApp API
- **Blockchain**: TON (testnet ready)

---

## 🚀 Next Steps

1. **Deploy to Deno Deploy** (see [deno-deploy.md](./deno-deploy.md))
2. **Create Telegram Bot** for Mini App
3. **Add Database Persistence** (Deno KV recommended)
4. **Connect TON Blockchain** for on-chain minting
5. **Implement Admin Dashboard** for house operations
6. **Add Analytics** for marketplace metrics

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Questions**: Check [deno-deploy.md](./deno-deploy.md)
- **Telegram**: @muddbro_house

---

## 📄 License

MIT © 2026 MUDDBRO

---

## 🎯 Roadmap

- [x] Phase 1: Live marketplace (current)
- [ ] Phase 2: On-chain minting (TON integration)
- [ ] Phase 3: Trading bots & AI agents
- [ ] Phase 4: Cross-chain bridges
- [ ] Phase 5: DAO governance

---

**Let's forge some legendary gear! 🔥⚒️**
