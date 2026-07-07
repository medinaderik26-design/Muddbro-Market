# 🚀 MUDDBRO NFT Store - Deno Deploy Guide

## Step 1: Prepare Your Repository ✅
- ✅ `store.ts` - Backend API (complete)
- ✅ `muddbro--nft-store.html` - Frontend (complete)
- ✅ `deno.json` - Configuration (added)

---

## Step 2: Deploy to Deno Deploy

### Option A: Deploy via GitHub Integration (Recommended)

1. **Go to Deno Deploy Dashboard**
   - Visit: https://dash.deno.com
   - Sign in with GitHub (or create account)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repository"
   - Choose `medinaderik26-design/Muddbro-Market`
   - Select branch: `main`
   - Production name: `muddbro-nft-store` (auto-generates URL)

3. **Configure Deployment**
   - Main module: `store.ts`
   - Leave environment variables blank for now
   - Click "Link and Deploy"

4. **Get Your URL**
   - After deployment, you'll get: `https://muddbro-nft-store.deno.dev`
   - This is your live backend!

### Option B: Deploy via CLI (Alternative)

```bash
# Install Deno (if needed)
# macOS/Linux:
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell):
iwr https://deno.land/install.ps1 -useb | iex

# Login to Deno
deno run -A https://deno.land/x/deployctl@1.14.1/deployctl.ts login

# Deploy from repo root
deno run -A https://deno.land/x/deployctl@1.14.1/deployctl.ts deploy --project=muddbro-nft-store
```

---

## Step 3: Update Frontend to Use Live Backend

Once you have your Deno Deploy URL, update `muddbro--nft-store.html`:

**Find this line (around line 65):**
```javascript
const API = window.location.href.split('?')[0];
```

**Replace with:**
```javascript
const API = 'https://muddbro-nft-store.deno.dev/';
```

Or make it dynamic for dev/prod:
```javascript
const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/' 
  : 'https://muddbro-nft-store.deno.dev/';
```

---

## Step 4: Test Live Deployment

1. **Open in Browser**
   - Go to: `https://muddbro-nft-store.deno.dev`
   - You should see the MUDDBRO FORGE interface

2. **Test API Endpoints**
   ```bash
   # Get Catalog
   curl -X POST https://muddbro-nft-store.deno.dev/ \
     -H "Content-Type: application/json" \
     -d '{"action":"get_catalog"}'

   # Test Identify
   curl -X POST https://muddbro-nft-store.deno.dev/ \
     -H "Content-Type: application/json" \
     -d '{"action":"identify","telegram_id":"123456","username":"testuser"}'\
   ```

3. **Test in Telegram Bot** (Next Step)

---

## Step 5: Create Telegram Bot

1. **Talk to @BotFather on Telegram**
   - Start a new chat: https://t.me/botfather
   - Send: `/newbot`
   - Follow prompts to create your bot
   - Save your: **BOT_TOKEN** (e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

2. **Get Bot Username**
   - Bot will have a username like: `@MuddbrosForgeBot`

3. **Set Webhook for Web App**
   ```bash
   curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebAppInfo \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://muddbro-nft-store.deno.dev",
       "webapp": {
         "url": "https://muddbro-nft-store.deno.dev"
       }
     }'
   ```

4. **Test in Telegram**
   - Open Telegram
   - Search for your bot: `@MuddbrosForgeBot`
   - Send: `/start`
   - Bot should offer button to open Web App

---

## Step 6: Enhance Backend with Persistence

Currently using in-memory storage. For production:

### Option A: Use Deno KV (Recommended for Deno Deploy)
```typescript
// Add to store.ts
const kv = await Deno.openKv();

// Usage:
await kv.set(["users", telegram_id], userProfile);
const user = await kv.get(["users", telegram_id]);
```

### Option B: PostgreSQL Database
```typescript
import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
  hostname: Deno.env.get("DB_HOST"),
  port: 5432,
  database: Deno.env.get("DB_NAME"),
  user: Deno.env.get("DB_USER"),
  password: Deno.env.get("DB_PASSWORD"),
});
```

### Option C: Supabase (PostgreSQL + Auth)
- Sign up: https://supabase.com
- Create project
- Connect via Deno client
- Set up tables: users, gear, listings

---

## Step 7: Monitoring & Logs

**View Deno Deploy Logs:**
1. Go to https://dash.deno.com
2. Select your project
3. Click "Logs" tab
4. See real-time API requests/errors

**Error Tracking:**
```typescript
// Add to your error handler
console.error("API Error:", {
  timestamp: new Date().toISOString(),
  action: body.action,
  error: String(e)
});
```

---

## Step 8: Security Checklist

- [ ] Validate all incoming data (Telegram ID, wallet address)
- [ ] Add rate limiting to prevent abuse
- [ ] Implement request signing for sensitive operations
- [ ] Store sensitive data (API keys) in environment variables
- [ ] Enable CORS properly (currently `*`)
- [ ] Add authentication for admin endpoints

---

## Environment Variables (for production)

Create in Deno Deploy dashboard:

```
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
HOUSE_WALLET=0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8
DB_URL=postgresql://user:pass@host/dbname
API_URL=https://muddbro-nft-store.deno.dev
```

---

## Quick Commands Reference

```bash
# Local testing
deno run --allow-net store.ts
# Open browser: http://localhost:8000

# Type check
deno check store.ts

# Format code
deno fmt store.ts

# Lint
deno lint store.ts
```

---

## Troubleshooting

**Issue: CORS errors in browser**
- Solution: Check corsHeaders in store.ts, ensure `*` is set

**Issue: Deno Deploy shows 500 error**
- Check logs: https://dash.deno.com → project → Logs
- Common: Missing imports, network issues

**Issue: Frontend can't reach backend**
- Ensure frontend API URL matches deployed URL
- Check browser console for network errors

---

## Next: Production Readiness Checklist

- [ ] Set up database (Deno KV or Supabase)
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Set up monitoring/alerts
- [ ] Create admin dashboard
- [ ] Test marketplace transactions
- [ ] Document API (OpenAPI/Swagger)
- [ ] Set up CI/CD for auto-deploy on push
- [ ] Create backup strategy
