export interface User {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  bio: string;
  balance: number; // Simulated SOL balance
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_wallet: string;
  seller_username: string;
  seller_avatar: string;
  title: string;
  description: string;
  price: number; // Price in SOL
  thumbnail_url: string;
  file_url: string; // The downloadable item link or premium access code
  category: string;
  tags: string[];
  upvotes: number;
  upvoted_by: string[]; // User IDs who upvoted
  status: 'draft' | 'published';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user_wallet: string;
  username: string;
  avatar_url: string;
  content: string;
  image_url?: string;
  likes: number;
  liked_by: string[]; // User IDs who liked
  reposts: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  product_id: string;
  product_title: string;
  product_thumbnail?: string;
  buyer_id: string;
  buyer_wallet: string;
  amount: number; // Amount paid in SOL
  signature: string; // Solana transaction signature
  status: 'pending' | 'success';
  created_at: string;
}
