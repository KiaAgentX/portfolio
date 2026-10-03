import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DB_FILE = path.join(process.cwd(), "server-db.json");

app.use(express.json());

// Helper to load/save JSON data
interface DBState {
  users: Array<{
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
    bio: string;
    balance: number;
    created_at: string;
  }>;
  products: Array<{
    id: string;
    seller_id: string;
    seller_wallet: string;
    seller_username: string;
    seller_avatar: string;
    title: string;
    description: string;
    price: number;
    thumbnail_url: string;
    file_url: string;
    category: string;
    tags: string[];
    upvotes: number;
    upvoted_by: string[];
    status: 'draft' | 'published';
    created_at: string;
  }>;
  posts: Array<{
    id: string;
    user_id: string;
    user_wallet: string;
    username: string;
    avatar_url: string;
    content: string;
    image_url?: string;
    likes: number;
    liked_by: string[];
    reposts: number;
    created_at: string;
  }>;
  purchases: Array<{
    id: string;
    product_id: string;
    product_title: string;
    product_thumbnail?: string;
    buyer_id: string;
    buyer_wallet: string;
    amount: number;
    signature: string;
    status: 'pending' | 'success';
    created_at: string;
  }>;
}

function getInitialDB(): DBState {
  const users = [
    {
      id: "u1",
      wallet_address: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      username: "SolanaSam",
      avatar_url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=150&q=80",
      bio: "Core contributor. Building open-source templates and smart contract libraries for the Solana ecosystem. Powered by local minting.",
      balance: 145.2,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "u2",
      wallet_address: "CYBeRg9rWt3Nu8u1pXvQp5kWYtcN4P8W7Q",
      username: "CyberLaunch",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      bio: "Web3 Product hunter. Passionate about decentralized launchpads, dApp UI templates, and crypto assets.",
      balance: 12.8,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "u3",
      wallet_address: "ARTByN8uYxt3r9WZvQP86kWAtcN2P4M9XW",
      username: "ArtByte",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bio: "Creator of generative arts & game templates. High fidelity vector UI styles. Committing on Solana Devnet.",
      balance: 4.5,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const products = [
    {
      id: "p1",
      seller_id: "u1",
      seller_wallet: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      seller_username: "SolanaSam",
      seller_avatar: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=150&q=80",
      title: "Solana + React Phantom dApp Template",
      description: "A super polished, robust boiler-plate containing Phantom, Solflare wallet adapters with beautiful standard Tailwind CSS, Next-styled responsive cards, and automated connection verification. Features state managers and full RPC config. Ready to deploy!",
      price: 0.15,
      thumbnail_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
      file_url: "https://github.com/react-solana-boilerplate/archive/main.zip",
      category: "Templates",
      tags: ["Solana", "React", "Tailwind", "Boilerplate"],
      upvotes: 42,
      upvoted_by: ["u2", "u3"],
      status: "published" as const,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "p2",
      seller_id: "u1",
      seller_wallet: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      seller_username: "SolanaSam",
      seller_avatar: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=150&q=80",
      title: "Decentralized Escrow Smart Contract",
      description: "Rust Anchor-based smart contract for secure decentralized transactions on Solana, handling multi-sig buyouts, locking periods, and partial dispute resolutions. Comprehensively documented with terminal test commands.",
      price: 0.8,
      thumbnail_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80",
      file_url: "https://solana.com/developers/escrow-rust-docs.zip",
      category: "Software",
      tags: ["Rust", "Anchor", "Smart Contract", "Escrow"],
      upvotes: 28,
      upvoted_by: ["u2"],
      status: "published" as const,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "p3",
      seller_id: "u3",
      seller_wallet: "ARTByN8uYxt3r9WZvQP86kWAtcN2P4M9XW",
      seller_username: "ArtByte",
      seller_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      title: "Neon Cyberpunk Avatar Vector Assets",
      description: "A pack of 50+ hand-crafted high-resolution SVGs and PNG assets of futuristic cyberpunk portraits. Extremely lightweight, optimized for dApp profiles or NFT collections.",
      price: 0.05,
      thumbnail_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
      file_url: "https://drive.google.com/uc?export=download&id=cyberpunk-neon-avatars-pack-demo",
      category: "Assets",
      tags: ["Design", "Cyberpunk", "Avatars", "SVGs"],
      upvotes: 19,
      upvoted_by: ["u1"],
      status: "published" as const,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const posts = [
    {
      id: "post1",
      user_id: "u1",
      user_wallet: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      username: "SolanaSam",
      avatar_url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=150&q=80",
      content: "Just listed the new 'Solana + React Phantom dApp Template' on LaunchSphere! It includes fully reactive wallet hooks and connection error fallbacks. Check it out in the Explore tab! Let me know if you explore the code.",
      likes: 12,
      liked_by: ["u2", "u3"],
      reposts: 2,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post2",
      user_id: "u2",
      user_wallet: "CYBeRg9rWt3Nu8u1pXvQp5kWYtcN4P8W7Q",
      username: "CyberLaunch",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      content: "Devnet is feeling super snappy today! Stoked to see more creators launching actual code templates and vector libraries instead of just random coin hype. LaunchSphere is the decentralized ecosystem we needed to swap digital assets.",
      likes: 7,
      liked_by: ["u1"],
      reposts: 1,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  const purchases = [
    {
      id: "pur1",
      product_id: "p3",
      product_title: "Neon Cyberpunk Avatar Vector Assets",
      product_thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
      buyer_id: "u1",
      buyer_wallet: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      amount: 0.05,
      signature: "3vV8G2M3uPszKzHq9z8uT56jKwR8gP2NWeNMyEaWc3rQxY7hJ8tLpSrm6VbZf4eK1",
      status: "success" as const,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return { users, products, posts, purchases };
}

function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  const initial = getInitialDB();
  saveDB(initial);
  return initial;
}

function saveDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file", err);
  }
}

// Ensure database is initialized
loadDB();

// API Endpoints
// Load User Profile or auto-create it if they connect wallet for the first time
app.get("/api/users/:wallet", (req, res) => {
  const { wallet } = req.params;
  const db = loadDB();
  let user = db.users.find(u => u.wallet_address.toLowerCase() === wallet.toLowerCase());
  
  if (!user) {
    // Auto-create user
    user = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      wallet_address: wallet,
      username: usernameFromWallet(wallet),
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`,
      bio: "Web3 Pioneer newly arrived at LaunchSphere. Enthusiastic about decentralized digital products.",
      balance: 10.0, // Starting balance for simulation
      created_at: new Date().toISOString()
    };
    db.users.push(user);
    saveDB(db);
  }
  res.json({ success: true, data: user });
});

// Update profile info
app.put("/api/users", (req, res) => {
  const { wallet_address, username, bio, avatar_url } = req.body;
  if (!wallet_address) {
    return res.status(400).json({ success: false, message: "wallet_address required" });
  }

  const db = loadDB();
  const userIdx = db.users.findIndex(u => u.wallet_address.toLowerCase() === wallet_address.toLowerCase());
  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  db.users[userIdx] = {
    ...db.users[userIdx],
    username: username || db.users[userIdx].username,
    bio: bio !== undefined ? bio : db.users[userIdx].bio,
    avatar_url: avatar_url || db.users[userIdx].avatar_url
  };

  saveDB(db);
  res.json({ success: true, data: db.users[userIdx] });
});

// Request free simulated SOL airdrop
app.post("/api/users/airdrop", (req, res) => {
  const { wallet_address, amount } = req.body;
  if (!wallet_address) {
    return res.status(400).json({ success: false, message: "wallet_address required" });
  }

  const db = loadDB();
  const userIdx = db.users.findIndex(u => u.wallet_address.toLowerCase() === wallet_address.toLowerCase());
  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const addAmount = amount || 5.0;
  db.users[userIdx].balance = Number((db.users[userIdx].balance + addAmount).toFixed(4));
  saveDB(db);
  res.json({ success: true, balance: db.users[userIdx].balance });
});

// Get all products
app.get("/api/products", (req, res) => {
  const db = loadDB();
  res.json({ success: true, data: db.products });
});

// Get detailed product
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, data: product });
});

// Launch new product
app.post("/api/products", (req, res) => {
  const { seller_wallet, title, description, price, thumbnail_url, file_url, category, tags } = req.body;
  
  if (!seller_wallet || !title || !price || !file_url || !category) {
    return res.status(400).json({ success: false, message: "Missing required product launch fields" });
  }

  const db = loadDB();
  const seller = db.users.find(u => u.wallet_address.toLowerCase() === seller_wallet.toLowerCase());
  if (!seller) {
    return res.status(404).json({ success: false, message: "Seller wallet profile not initialized" });
  }

  const newId = "p_" + Math.random().toString(36).substr(2, 9);
  const newProduct = {
    id: newId,
    seller_id: seller.id,
    seller_wallet: seller.wallet_address,
    seller_username: seller.username,
    seller_avatar: seller.avatar_url,
    title,
    description: description || "",
    price: Number(price),
    thumbnail_url: thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    file_url,
    category,
    tags: Array.isArray(tags) ? tags : [],
    upvotes: 0,
    upvoted_by: [],
    status: "published" as const,
    created_at: new Date().toISOString()
  };

  db.products.unshift(newProduct);

  // Auto-compose a launch notification post on social feed so everyone sees!
  const launchPost = {
    id: "post_launch_" + Math.random().toString(36).substr(2, 9),
    user_id: seller.id,
    user_wallet: seller.wallet_address,
    username: seller.username,
    avatar_url: seller.avatar_url,
    content: `🚀 NEW MINGLED RELEASE: Just launched '${title}' in the '${category}' category for only ${price} SOL! Download the build directly now!`,
    image_url: newProduct.thumbnail_url,
    likes: 0,
    liked_by: [],
    reposts: 0,
    created_at: new Date().toISOString()
  };
  db.posts.unshift(launchPost);

  saveDB(db);
  res.json({ success: true, data: newProduct });
});

// Upvote product toggle
app.post("/api/products/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ success: false, message: "wallet_address required" });
  }

  const db = loadDB();
  const productIdx = db.products.findIndex(p => p.id === id);
  if (productIdx === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const product = db.products[productIdx];
  const user = db.users.find(u => u.wallet_address.toLowerCase() === wallet_address.toLowerCase());
  const userId = user ? user.id : wallet_address;

  const upvoteIdx = product.upvoted_by.indexOf(userId);
  if (upvoteIdx > -1) {
    // Remove upvote
    product.upvoted_by.splice(upvoteIdx, 1);
    product.upvotes = Math.max(0, product.upvotes - 1);
  } else {
    // Add upvote
    product.upvoted_by.push(userId);
    product.upvotes += 1;
  }

  saveDB(db);
  res.json({ success: true, upvotes: product.upvotes, upvoted_by: product.upvoted_by });
});

// Get all social posts
app.get("/api/posts", (req, res) => {
  const db = loadDB();
  res.json({ success: true, data: db.posts });
});

// Add a social post
app.post("/api/posts", (req, res) => {
  const { wallet_address, content, image_url } = req.body;
  
  if (!wallet_address || !content) {
    return res.status(400).json({ success: false, message: "Missing wallet_address or body content" });
  }

  const db = loadDB();
  const creator = db.users.find(u => u.wallet_address.toLowerCase() === wallet_address.toLowerCase());
  
  if (!creator) {
    return res.status(404).json({ success: false, message: "Creator profile not active" });
  }

  const newPost = {
    id: "post_" + Math.random().toString(36).substr(2, 9),
    user_id: creator.id,
    user_wallet: creator.wallet_address,
    username: creator.username,
    avatar_url: creator.avatar_url,
    content,
    image_url: image_url || undefined,
    likes: 0,
    liked_by: [],
    reposts: 0,
    created_at: new Date().toISOString()
  };

  db.posts.unshift(newPost);
  saveDB(db);
  res.json({ success: true, data: newPost });
});

// Like social post toggle
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ success: false, message: "wallet_address required" });
  }

  const db = loadDB();
  const postIdx = db.posts.findIndex(p => p.id === id);
  if (postIdx === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const post = db.posts[postIdx];
  const user = db.users.find(u => u.wallet_address.toLowerCase() === wallet_address.toLowerCase());
  const userId = user ? user.id : wallet_address;

  const likeIdx = post.liked_by.indexOf(userId);
  if (likeIdx > -1) {
    // Unlike
    post.liked_by.splice(likeIdx, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.liked_by.push(userId);
    post.likes += 1;
  }

  saveDB(db);
  res.json({ success: true, likes: post.likes, liked_by: post.liked_by });
});

// Get purchase logs
app.get("/api/purchases", (req, res) => {
  const { wallet_address } = req.query;
  const db = loadDB();
  
  if (wallet_address) {
    const list = db.purchases.filter(p => p.buyer_wallet.toLowerCase() === (wallet_address as string).toLowerCase());
    return res.json({ success: true, data: list });
  }
  res.json({ success: true, data: db.purchases });
});

// Log a verified purchase
app.post("/api/purchases", (req, res) => {
  const { product_id, buyer_wallet, signature } = req.body;

  if (!product_id || !buyer_wallet || !signature) {
    return res.status(400).json({ success: false, message: "Missing buy authorization details" });
  }

  const db = loadDB();
  const product = db.products.find(p => p.id === product_id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Target marketplace product not found" });
  }

  const buyer = db.users.find(u => u.wallet_address.toLowerCase() === buyer_wallet.toLowerCase());
  if (!buyer) {
    return res.status(400).json({ success: false, message: "Buyer profile not loaded on LaunchSphere" });
  }

  if (buyer.balance < product.price) {
    return res.status(400).json({ success: false, message: `Insufficient Solana Devnet funds to purchase this product. Balance is ${buyer.balance} SOL.` });
  }

  // Deduct/Credit balances
  buyer.balance = Number((buyer.balance - product.price).toFixed(4));
  
  // Find seller
  const seller = db.users.find(u => u.id === product.seller_id);
  if (seller) {
    seller.balance = Number((seller.balance + product.price).toFixed(4));
  }

  const newPurchase = {
    id: "pur_" + Math.random().toString(36).substr(2, 9),
    product_id: product.id,
    product_title: product.title,
    product_thumbnail: product.thumbnail_url,
    buyer_id: buyer.id,
    buyer_wallet: buyer.wallet_address,
    amount: product.price,
    signature,
    status: "success" as const,
    created_at: new Date().toISOString()
  };

  db.purchases.unshift(newPurchase);
  saveDB(db);

  res.json({ success: true, data: newPurchase, updated_balance: buyer.balance });
});


// Helper to format short human name from wallet
function usernameFromWallet(wallet: string): string {
  if (wallet.length > 8) {
    return `SolUser_${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 4)}`;
  }
  return `User_${wallet}`;
}

// Liveness probe for deploys and monitoring (v0.1 debug)
app.get("/api/health", (_req, res) => {
  let version = "0.1.0";
  try {
    version = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")).version || version;
  } catch { /* keep default */ }
  const db = loadDB();
  res.json({ status: "ok", version, uptime: Math.round(process.uptime()), db: { users: db.users.length, products: db.products.length, posts: db.posts.length, purchases: db.purchases.length } });
});

// JSON 404 for unknown API routes (must stay before the SPA fallback)
app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

async function startServer() {
  // Vite integration for development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LaunchSphere v0 Backend] standing by at http://0.0.0.0:${PORT}`);
  });
}

startServer();
