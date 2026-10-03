import React from 'react';
import { Trophy, Coins, Award } from 'lucide-react';
import { User } from '../types';

interface LeaderboardProps {
  leaderboardsList: User[];
  walletAddress: string;
}

export default function Leaderboard({ leaderboardsList, walletAddress }: LeaderboardProps) {
  return (
    <div id="tab-content-leaderboard" className="flex-1 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Header section */}
      <div className="pb-4 border-b border-white/5 text-left">
        <h1 className="text-3xl font-display font-light italic text-white mb-1.5">
          Elite Solana <span className="text-yellow-400 font-normal">Minter Scores</span>
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">Review Sandbox balance metrics for developers, creators, and buyers participating in the ecosystem.</p>
      </div>

      {/* Holographic podiums for the top three */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {leaderboardsList.slice(0, 3).map((user, index) => {
          const rankColors = [
            'from-yellow-400/20 to-amber-500/5 border-yellow-400/45 text-yellow-400',
            'from-zinc-300/20 to-zinc-500/5 border-zinc-400/35 text-zinc-300',
            'from-amber-600/20 to-amber-900/5 border-amber-600/35 text-amber-500'
          ];
          const rankMedals = ['🥇 First Minter', '🥈 Silver Code', '🥉 Bronze Asset'];
          
          return (
            <div 
              key={user.id}
              className={`bg-gradient-to-br ${rankColors[index]} border rounded-2xl p-5 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="absolute top-2 right-2 flex items-center justify-center bg-white/5 rounded-full p-1 border border-white/5">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2">{rankMedals[index]}</p>
              
              <div className="relative inline-block mb-3">
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white/10 shadow-lg bg-zinc-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.wallet_address}`;
                  }}
                />
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center font-mono font-bold text-xs">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-display font-bold text-white text-base truncate">{user.username}</h3>
              <p className="text-[9px] font-mono text-zinc-500 truncate mb-3">{user.wallet_address}</p>

              <div className="bg-black/30 py-2 rounded-xl border border-white/5 inline-flex items-center justify-center gap-1.5 px-4">
                <Coins className="h-4 w-4 text-[#14F195]" />
                <span className="font-mono text-xs font-bold text-[#14F195]">{user.balance.toFixed(2)} SOL</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main rank listing table */}
      <div className="relative overflow-hidden bg-[#070712]/45 rounded-2xl border border-white/5 p-6 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-yellow-500/[0.02] blur-[90px] rounded-full pointer-events-none"></div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <th className="pb-3 text-center w-12">Rank</th>
                <th className="pb-3">Developer/Minter Name</th>
                <th className="pb-3">Solana Address</th>
                <th className="pb-3 text-right">Devnet SOL Wealth</th>
                <th className="pb-3 text-right">Ecosystem Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-xs">
              {leaderboardsList.map((user, idx) => {
                const isPrimary = user.wallet_address.toLowerCase() === walletAddress?.toLowerCase();
                return (
                  <tr 
                    key={user.id} 
                    className={`transition hover:bg-white/[0.01] ${isPrimary ? 'bg-[#9945FF]/10' : ''}`}
                  >
                    <td className="py-4 text-center">
                      <span className="font-mono font-bold text-zinc-300">{idx + 1}</span>
                    </td>
                    <td className="py-4 font-semibold flex items-center gap-2">
                      <img 
                        src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.wallet_address}`} 
                        alt={user.username} 
                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.wallet_address}`;
                        }}
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-zinc-100 font-bold">{user.username}</span>
                        {isPrimary && <span className="text-[8px] text-[#9945FF] font-bold uppercase tracking-widest">You / Primary</span>}
                      </div>
                    </td>
                    <td className="py-4 font-mono text-zinc-500 text-[10px]">
                      {user.wallet_address.substring(0, 8)}...{user.wallet_address.substring(user.wallet_address.length - 8)}
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-[#14F195]">
                      {user.balance.toFixed(2)} SOL
                    </td>
                    <td className="py-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[9px] uppercase font-mono tracking-widest text-[#14F195] font-semibold">
                        ACTIVE_NODE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
