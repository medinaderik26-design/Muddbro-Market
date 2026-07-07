import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Genesis Catalog ────────────────────────────────────────────────────────
const CATALOG = [
  { 
    key: "sun-forged-molten-crown", 
    name: "Sun-Forged Molten Crown", 
    index: 1, 
    image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa1_image.jpg", 
    tribe: "Sun-Forged", 
    rarity: "Genesis Prime",
    mint_price: 1000,
    is_house: true
  },
  { 
    key: "lunar-whisper-staff", 
    name: "Lunar Whisper Staff", 
    index: 2, 
    image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa2_image.jpg", 
    tribe: "Moon-Touched", 
    rarity: "Genesis",
    mint_price: 750
  },
  { 
    key: "void-echo-blade", 
    name: "Void Echo Blade", 
    index: 3, 
    image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa3_image.jpg", 
    tribe: "Void-Born", 
    rarity: "Legendary",
    mint_price: 900
  },
  { 
    key: "forest-guardian-bow", 
    name: "Forest Guardian Bow", 
    index: 4, 
    image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa4_image.jpg", 
    tribe: "Nature-Bound", 
    rarity: "Epic",
    mint_price: 600
  },
  { 
    key: "storm-breaker-axe", 
    name: "Storm Breaker Axe", 
    index: 5, 
    image: "https://media.base44.com/images/public/6a4020251d35ee93ec909dfa/d38196aa5_image.jpg", 
    tribe: "Storm-Forged", 
    rarity: "Rare",
    mint_price: 500
  }
];

const COLLECTION_ADDRESS = "kQAid8tfDNbNLLHWDInRbhGK_Rfv_ouRtL7ocitfMv07KJ2b";
const G0_WALLET = "0QAG3lJZz24VOz6eicLTqP5M-YtfKJ96Naq3FPUz548Pcsw8";
const MARKET_FEE_BPS = 500; // 5%
const HOUSE_TELEGRAM_ID = "muddbro_house";

// In-memory storage (replace with database for production)
interface UserProfile {
  telegram_id: string;
  username: string;
  mudd_balance: number;
  mudd_ore_balance: number;
  ton_wallet_address?: string;
}

interface GearItem {
  id: string;
  owner_id: string;
  catalog_key: string;
  minted_at: number;
  on_chain: boolean;
}

interface Listing {
  id: string;
  gear_id: string;
  seller_id: string;
  price_mudd: number;
  created_at: number;
}

const userProfiles = new Map<string, UserProfile>();
const userGear = new Map<string, GearItem[]>();
const listings = new Map<string, Listing>();

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Validate Telegram ID
function isValidTelegramId(id: string): boolean {
  return /^[0-9]+$/.test(id) || /^@?[a-zA-Z0-9_]{5,32}$/.test(id);
}

// Validate TON address
function isValidTonAddress(addr: string): boolean {
  return /^[0QkU][QUfg0-9a-zA-Z]{46,47}$/.test(addr);
}

// Get or create user profile
function getOrCreateUser(telegram_id: string, username: string): UserProfile {
  if (!userProfiles.has(telegram_id)) {
    userProfiles.set(telegram_id, {
      telegram_id,
      username,
      mudd_balance: 5000, // Starting balance
      mudd_ore_balance: 100,
    });
  }
  return userProfiles.get(telegram_id)!;
}

// API Handlers
async function handleIdentify(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id, username } = body;
  
  if (!telegram_id || typeof telegram_id !== 'string') {
    return { ok: false, error: "Invalid telegram_id" };
  }

  if (!isValidTelegramId(telegram_id as string)) {
    return { ok: false, error: "Invalid Telegram ID format" };
  }

  const user = getOrCreateUser(telegram_id as string, username as string || "");
  return { 
    ok: true, 
    mudd_balance: user.mudd_balance,
    mudd_ore_balance: user.mudd_ore_balance,
    ton_wallet_address: user.ton_wallet_address || null
  };
}

async function handleGetCatalog(): Promise<Record<string, unknown>> {
  return { 
    ok: true, 
    catalog: CATALOG.map(item => ({
      ...item,
      id: item.key,
      onchain: false
    }))
  };
}

async function handleRequestMint(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id, catalog_key } = body;

  if (!telegram_id || !catalog_key) {
    return { ok: false, error: "Missing telegram_id or catalog_key" };
  }

  const item = CATALOG.find(c => c.key === catalog_key);
  if (!item) {
    return { ok: false, error: "Item not found in catalog" };
  }

  const user = userProfiles.get(telegram_id as string);
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  if (user.mudd_balance < item.mint_price) {
    return { ok: false, error: `Insufficient MUDD. Need ${item.mint_price}, have ${user.mudd_balance}` };
  }

  // Deduct MUDD
  user.mudd_balance -= item.mint_price;

  // Add gear to user inventory
  if (!userGear.has(telegram_id as string)) {
    userGear.set(telegram_id as string, []);
  }

  const gearId = generateId();
  const newGear: GearItem = {
    id: gearId,
    owner_id: telegram_id as string,
    catalog_key: catalog_key as string,
    minted_at: Date.now(),
    on_chain: false
  };

  userGear.get(telegram_id as string)!.push(newGear);

  return { 
    ok: true, 
    message: `Successfully minted ${item.name}!`,
    gear_id: gearId,
    new_balance: user.mudd_balance
  };
}

async function handleGetVault(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id } = body;

  if (!telegram_id) {
    return { ok: false, error: "Missing telegram_id" };
  }

  const gear = userGear.get(telegram_id as string) || [];
  
  const enrichedGear = gear.map(g => {
    const catalogItem = CATALOG.find(c => c.key === g.catalog_key);
    return {
      ...g,
      name: catalogItem?.name || "Unknown",
      image: catalogItem?.image || "",
      rarity: catalogItem?.rarity || "Common"
    };
  });

  return { ok: true, vault: enrichedGear };
}

async function handleListGear(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id, gear_id, price_mudd } = body;

  if (!telegram_id || !gear_id || !price_mudd) {
    return { ok: false, error: "Missing parameters" };
  }

  const userGearList = userGear.get(telegram_id as string) || [];
  const gear = userGearList.find(g => g.id === gear_id);

  if (!gear) {
    return { ok: false, error: "Gear not found in vault" };
  }

  const listingId = generateId();
  const listing: Listing = {
    id: listingId,
    gear_id: gear_id as string,
    seller_id: telegram_id as string,
    price_mudd: Number(price_mudd),
    created_at: Date.now()
  };

  listings.set(listingId, listing);

  return { 
    ok: true, 
    message: "Gear listed successfully",
    listing_id: listingId
  };
}

async function handleGetMarket(): Promise<Record<string, unknown>> {
  const marketListings = Array.from(listings.values()).map(listing => {
    const gear = userGear.get(listing.seller_id)?.find(g => g.id === listing.gear_id);
    const catalogItem = CATALOG.find(c => c.key === gear?.catalog_key);

    return {
      listing_id: listing.id,
      gear_id: listing.gear_id,
      seller_id: listing.seller_id,
      price_mudd: listing.price_mudd,
      name: catalogItem?.name || "Unknown",
      image: catalogItem?.image || "",
      rarity: catalogItem?.rarity || "Common",
      tribe: catalogItem?.tribe || "Unknown"
    };
  });

  return { ok: true, listings: marketListings };
}

async function handleBuyListing(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id, listing_id } = body;

  if (!telegram_id || !listing_id) {
    return { ok: false, error: "Missing parameters" };
  }

  const listing = listings.get(listing_id as string);
  if (!listing) {
    return { ok: false, error: "Listing not found" };
  }

  const buyer = userProfiles.get(telegram_id as string);
  if (!buyer) {
    return { ok: false, error: "Buyer not found" };
  }

  if (buyer.mudd_balance < listing.price_mudd) {
    return { ok: false, error: "Insufficient MUDD" };
  }

  // Calculate fees
  const fee = Math.floor(listing.price_mudd * MARKET_FEE_BPS / 10000);
  const sellerPayout = listing.price_mudd - fee;

  // Update balances
  buyer.mudd_balance -= listing.price_mudd;
  
  const seller = userProfiles.get(listing.seller_id);
  if (seller) {
    seller.mudd_balance += sellerPayout;
  }

  // Transfer gear
  const sellerGear = userGear.get(listing.seller_id);
  if (sellerGear) {
    const gearIndex = sellerGear.findIndex(g => g.id === listing.gear_id);
    if (gearIndex !== -1) {
      const gearItem = sellerGear.splice(gearIndex, 1)[0];
      gearItem.owner_id = telegram_id as string;
      
      if (!userGear.has(telegram_id as string)) {
        userGear.set(telegram_id as string, []);
      }
      userGear.get(telegram_id as string)!.push(gearItem);
    }
  }

  // Remove listing
  listings.delete(listing_id as string);

  return {
    ok: true,
    message: "Purchase successful!",
    new_balance: buyer.mudd_balance,
    fee_paid: fee
  };
}

async function handleCancelListing(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { listing_id, telegram_id } = body;

  if (!listing_id) {
    return { ok: false, error: "Missing listing_id" };
  }

  const listing = listings.get(listing_id as string);
  if (!listing) {
    return { ok: false, error: "Listing not found" };
  }

  if (listing.seller_id !== telegram_id) {
    return { ok: false, error: "Not authorized to cancel this listing" };
  }

  listings.delete(listing_id as string);
  return { ok: true, message: "Listing cancelled" };
}

async function handleLinkWallet(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { telegram_id, wallet_address } = body;

  if (!telegram_id || !wallet_address) {
    return { ok: false, error: "Missing parameters" };
  }

  if (!isValidTonAddress(wallet_address as string)) {
    return { ok: false, error: "Invalid TON wallet address format" };
  }

  const user = userProfiles.get(telegram_id as string);
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  user.ton_wallet_address = wallet_address as string;
  return { ok: true, message: "Wallet linked successfully" };
}

// Main request handler
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(STORE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json() as Record<string, unknown>;
      const action = body.action as string || "";

      let response: Record<string, unknown>;

      switch (action) {
        case "identify":
          response = await handleIdentify(body);
          break;
        case "get_catalog":
          response = await handleGetCatalog();
          break;
        case "request_mint":
          response = await handleRequestMint(body);
          break;
        case "get_vault":
          response = await handleGetVault(body);
          break;
        case "list_gear":
          response = await handleListGear(body);
          break;
        case "get_market":
          response = await handleGetMarket();
          break;
        case "buy_listing":
          response = await handleBuyListing(body);
          break;
        case "cancel_listing":
          response = await handleCancelListing(body);
          break;
        case "link_wallet":
          response = await handleLinkWallet(body);
          break;
        default:
          response = { ok: false, error: "Unknown action" };
      }

      return new Response(JSON.stringify(response), { 
        status: 200, 
        headers: corsHeaders 
      });
    } catch (e) {
      console.error("muddbroNftStore API error:", e);
      return new Response(
        JSON.stringify({ ok: false, error: String(e) }), 
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response("Not found", { status: 404 });
});

// Placeholder for store HTML (reference to the frontend)
const STORE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MUDDBRO // NFT FORGE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
body { background: #05050a; color: #e0f0ff; font-family: 'Courier New', monospace; }
</style>
</head>
<body>
<div id="app">Loading MUDDBRO FORGE...</div>
<script>
// Frontend is served separately - this is the API backend
document.body.innerHTML = '<div style="text-align:center; margin-top:100px;"><h1>🔥 MUDDBRO FORGE API 🔥</h1><p>Backend is running. Serve the HTML frontend separately.</p></div>';
</script>
</body>
</html>
`;
