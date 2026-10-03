import { User, Product, Post, Purchase } from "../types";

// Base API fetches
export async function getProfile(walletAddress: string): Promise<User> {
  const response = await fetch(`/api/users/${walletAddress}`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch user profile");
  }
  return result.data;
}

export async function updateProfile(data: {
  wallet_address: string;
  username: string;
  bio: string;
  avatar_url: string;
}): Promise<User> {
  const response = await fetch("/api/users", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to update profile");
  }
  return result.data;
}

export async function triggerAirdrop(walletAddress: string, amount: number = 5.0): Promise<number> {
  const response = await fetch("/api/users/airdrop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress, amount }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Airdrop failed");
  }
  return result.balance;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch products");
  }
  return result.data;
}

export async function getProductDetail(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch product details");
  }
  return result.data;
}

export async function launchProduct(data: {
  seller_wallet: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  file_url: string;
  category: string;
  tags: string[];
}): Promise<Product> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to launch design product");
  }
  return result.data;
}

export async function toggleUpvote(id: string, walletAddress: string): Promise<{ upvotes: number; upvoted_by: string[] }> {
  const response = await fetch(`/api/products/${id}/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to upvote product");
  }
  return { upvotes: result.upvotes, upvoted_by: result.upvoted_by };
}

export async function getPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts");
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to get feed posts");
  }
  return result.data;
}

export async function addPost(walletAddress: string, content: string, imageUrl?: string): Promise<Post> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress, content, image_url: imageUrl }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Post creation failed");
  }
  return result.data;
}

export async function togglePostLike(id: string, walletAddress: string): Promise<{ likes: number; liked_by: string[] }> {
  const response = await fetch(`/api/posts/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to link/unlike post");
  }
  return { likes: result.likes, liked_by: result.liked_by };
}

export async function getPurchases(walletAddress?: string): Promise<Purchase[]> {
  const url = walletAddress ? `/api/purchases?wallet_address=${encodeURIComponent(walletAddress)}` : "/api/purchases";
  const response = await fetch(url);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch purchases file");
  }
  return result.data;
}

export async function confirmPurchase(product_id: string, buyer_wallet: string, signature: string): Promise<Purchase> {
  const response = await fetch("/api/purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id, buyer_wallet, signature }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Purchase verification rejected");
  }
  return result.data;
}
