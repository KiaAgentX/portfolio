import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { Post, User } from '../types';

interface PostCardProps {
  key?: React.Key;
  post: Post;
  walletAddress: string;
  userProfile: User | null;
  onLike: (postId: string) => void;
}

export default function PostCard({
  post,
  walletAddress,
  userProfile,
  onLike,
}: PostCardProps) {
  const hasLiked = walletAddress && userProfile && post.liked_by.includes(userProfile.id);

  return (
    <div 
      id={`post-envelope-${post.id}`}
      className="bg-[#070712]/45 p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden hover:border-[#9945FF]/30 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img 
            src={post.avatar_url} 
            alt={post.username} 
            className="w-10 h-10 rounded-full object-cover border border-white/10 bg-zinc-900"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${post.user_wallet}`;
            }}
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100">{post.username}</span>
              <span className="text-[9px] font-mono bg-white/[0.03] border border-white/5 text-zinc-500 px-1.5 py-0.2 rounded-sm truncate max-w-[80px]">
                {post.user_wallet.substring(0, 4)}...{post.user_wallet.slice(-4)}
              </span>
            </div>
            
            <p className="text-[9px] text-[#14F195] font-mono mt-0.5 font-bold">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Ledger transaction type tag */}
        <div className="font-mono text-[9px] text-zinc-500 flex items-center gap-1.5 bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/5 select-none">
          <span className="w-1.5 h-1.5 bg-[#9945FF] rounded-full animate-pulse"></span>
          <span>TX_SOCIAL_METADATA</span>
        </div>
      </div>

      {/* Message body */}
      <p className="text-xs text-zinc-200 leading-relaxed font-sans font-light whitespace-pre-wrap text-left">
        {post.content}
      </p>

      {/* Attached Image container */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden max-h-72 border border-white/5 bg-[#030308] relative group">
          <img 
            src={post.image_url} 
            alt="Asset Attachments" 
            className="w-full object-cover max-h-72 group-hover:scale-101 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Action triggers tray */}
      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-mono transition-all duration-200 cursor-pointer hover:scale-105 ${
            hasLiked 
              ? 'text-[#14F195] font-bold' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#14F195] stroke-[#14F195]' : 'opacity-65'}`} />
          <span>{post.likes} Likes</span>
        </button>

        <div className="text-zinc-500 font-mono text-[9px] bg-white/[0.01] border border-white/5 px-2 py-0.5 rounded-sm select-all">
          ID: {post.id.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
}
