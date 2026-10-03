import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Sparkles, 
  Compass, 
  PlusCircle, 
  Trophy, 
  FolderLock, 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  Coins, 
  Flame, 
  Clock, 
  Tag, 
  Info, 
  LogOut, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { User, Product, Post, Purchase } from './types';
import { 
  getProfile, 
  updateProfile, 
  triggerAirdrop, 
  getProducts, 
  getProductDetail, 
  launchProduct, 
  toggleUpvote, 
  getPosts, 
  addPost, 
  togglePostLike, 
  getPurchases, 
  confirmPurchase 
} from './services/api';

// Child components loading
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import PostCard from './components/PostCard';
import Leaderboard from './components/Leaderboard';
import VaultKeys from './components/VaultKeys';
import WalletModal from './components/WalletModal';

type TabId = 'feed' | 'explore' | 'launch' | 'leaderboard' | 'purchases';

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string>('SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  // Navigation & filter states
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearchKeyword, setProductSearchKeyword] = useState<string>('');
  
  // Post composing
  const [newPostText, setNewPostText] = useState<string>('');
  const [newPostImage, setNewPostImage] = useState<string>('');
  const [isPublishingPost, setIsPublishingPost] = useState<boolean>(false);

  // Launch product form states
  const [launchTitle, setLaunchTitle] = useState<string>('');
  const [launchDescription, setLaunchDescription] = useState<string>('');
  const [launchPrice, setLaunchPrice] = useState<number>(0.15);
  const [launchCategory, setLaunchCategory] = useState<string>('Templates');
  const [launchThumbnail, setLaunchThumbnail] = useState<string>('');
  const [launchFileUrl, setLaunchFileUrl] = useState<string>('');
  const [launchTagsString, setLaunchTagsString] = useState<string>('Solana, React, Boilerplate');
  const [isLaunchingProduct, setIsLaunchingProduct] = useState<boolean>(false);

  // Edit profile states
  const [editUsername, setEditUsername] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [showProfileConfig, setShowProfileConfig] = useState<boolean>(false);

  // Detail Modal popup for product buying/downloading
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);

  // UI Modals toggles
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [solPrice, setSolPrice] = useState<number>(148.22);
  const [epochNum, setEpochNum] = useState<number>(642);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load and subscribe simulated market feed ticking
  useEffect(() => {
    fetchUserData();
    fetchMarketData();
    
    // Smooth SOL price delta feedback
    const solInterval = setInterval(() => {
      setSolPrice(prev => Number((prev + (Math.random() * 0.3 - 0.15)).toFixed(2)));
    }, 12000);
    
    const epochInterval = setInterval(() => {
      setEpochNum(prev => prev + 1);
    }, 60000);

    return () => {
      clearInterval(solInterval);
      clearInterval(epochInterval);
    };
  }, [walletAddress]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchUserData = async () => {
    if (!walletAddress) return;
    try {
      const profile = await getProfile(walletAddress);
      setUserProfile(profile);
      setEditUsername(profile.username);
      setEditBio(profile.bio);
      setEditAvatar(profile.avatar_url);
    } catch (err: any) {
      console.error("Error loading profile details:", err);
    }
  };

  const fetchMarketData = async () => {
    try {
      const [prodsList, postsList, purchasesList] = await Promise.all([
        getProducts(),
        getPosts(),
        getPurchases(walletAddress || undefined)
      ]);
      setProducts(prodsList);
      setPosts(postsList);
      setPurchases(purchasesList);
    } catch (err: any) {
      console.error("Error fetching market registry states:", err);
    }
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    showToast(`Linked Account: ${address.substring(0, 6)}...${address.slice(-4)}`, 'success');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;
    try {
      setIsSavingProfile(true);
      const updated = await updateProfile({
        wallet_address: walletAddress,
        username: editUsername,
        bio: editBio,
        avatar_url: editAvatar
      });
      setUserProfile(updated);
      setShowProfileConfig(false);
      showToast("Profile credentials broadcast success!", "success");
      fetchMarketData();
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLaunchProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      showToast("Please link an interactive Solana wallet key first!", "error");
      setIsWalletOpen(true);
      return;
    }
    if (!launchTitle || launchPrice <= 0 || !launchFileUrl) {
      showToast("Title, price, and secure resource download URL are required.", "error");
      return;
    }

    try {
      setIsLaunchingProduct(true);
      const tags = launchTagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      const response = await launchProduct({
        seller_wallet: walletAddress,
        title: launchTitle,
        description: launchDescription,
        price: Number(launchPrice),
        thumbnail_url: launchThumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        file_url: launchFileUrl,
        category: launchCategory,
        tags
      });

      showToast(`Successfully deployed program metadata: ${response.title}!`, "success");
      
      // Cleanup forms
      setLaunchTitle('');
      setLaunchDescription('');
      setLaunchPrice(0.1);
      setLaunchThumbnail('');
      setLaunchFileUrl('');
      setLaunchTagsString('Solana, Web3');
      
      await fetchMarketData();
      await fetchUserData(); // Update scores/shares
      setActiveTab('explore');
    } catch (err: any) {
      showToast(err.message || "Error deploying build metadata", "error");
    } finally {
      setIsLaunchingProduct(false);
    }
  };

  const handleProductUpvoteSubmit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!walletAddress) {
      showToast("Connecting wallet is required to upvote programs!", "info");
      setIsWalletOpen(true);
      return;
    }
    try {
      const upvDetails = await toggleUpvote(id, walletAddress);
      
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, upvotes: upvDetails.upvotes, upvoted_by: upvDetails.upvoted_by };
        }
        return p;
      }));

      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(prev => prev ? { ...prev, upvotes: upvDetails.upvotes, upvoted_by: upvDetails.upvoted_by } : null);
      }
      
      showToast("Vote broadcast success!", "success");
    } catch (err: any) {
      showToast(err.message || "Upvote transaction rejected", "error");
    }
  };

  const handlePostCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      showToast("Link wallet connection before broadcasting messages!", "error");
      setIsWalletOpen(true);
      return;
    }
    if (!newPostText.trim()) return;

    try {
      setIsPublishingPost(true);
      await addPost(walletAddress, newPostText.trim(), newPostImage.trim() || undefined);
      setNewPostText('');
      setNewPostImage('');
      showToast("Interactivity Ledger post published safely!", "success");
      await fetchMarketData();
    } catch (err: any) {
      showToast(err.message || "Interactivity fault", "error");
    } finally {
      setIsPublishingPost(false);
    }
  };

  const handlePostLikeSubmit = async (postId: string) => {
    if (!walletAddress) {
      showToast("Identity verification key missing! Connect Wallet.", "info");
      setIsWalletOpen(true);
      return;
    }
    try {
      const lkData = await togglePostLike(postId, walletAddress);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: lkData.likes, liked_by: lkData.liked_by };
        }
        return p;
      }));
    } catch (err: any) {
      showToast("Like adjustment rejected", "error");
    }
  };

  const handlePurchaseProductSubmit = async (product: Product) => {
    if (!walletAddress) {
      showToast("Simulated phantom wallet connection required!", "info");
      setIsWalletOpen(true);
      return;
    }

    if (userProfile && userProfile.balance < product.price) {
      showToast(`Insufficient SOL funds! Balance is ${userProfile.balance.toFixed(2)} SOL. Request a free Airdrop in the wallet cockpit.`, "error");
      setIsWalletOpen(true);
      return;
    }

    try {
      setIsPurchasingId(product.id);
      showToast(`Initiating secure smart escrow for '${product.title}'...`, "info");
      await new Promise(r => setTimeout(r, 1200));

      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let mockSig = "SOL_SIG_";
      for (let i = 0; i < 45; i++) {
        mockSig += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      await confirmPurchase(product.id, walletAddress, mockSig);
      showToast(`MINTED SUCCESS! Escrow settled. Signature: ${mockSig.substring(0, 15)}...`, "success");
      
      await fetchUserData();
      await fetchMarketData();

      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct(product);
      }
    } catch (err: any) {
      showToast(err.message || "Solana validator rejected signatures", "error");
    } finally {
      setIsPurchasingId(null);
    }
  };

  const isUserBoughtProduct = (prodId: string) => {
    return purchases.some(pur => pur.product_id === prodId && pur.buyer_wallet.toLowerCase() === walletAddress.toLowerCase());
  };

  // Filter products lists
  const filteredProducts = products.filter(p => {
    const categoryMatches = productCategoryFilter === 'all' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const searchMatches = p.title.toLowerCase().includes(productSearchKeyword.toLowerCase()) || 
                          p.description.toLowerCase().includes(productSearchKeyword.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(productSearchKeyword.toLowerCase()));
    return categoryMatches && searchMatches;
  });

  // Unique rank array calculations
  const leaderboardsList = [...(userProfile ? [userProfile] : []), 
    {
      id: "u1",
      wallet_address: "SOLvEp17Zg8u2D5m6X2pYwtRAbCq7R9N5T",
      username: "SolanaSam",
      avatar_url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=150&q=80",
      bio: "Core contributor. Building open-source templates and smart contract libraries for the Solana ecosystem.",
      balance: 145.2,
      created_at: ""
    },
    {
      id: "u2",
      wallet_address: "CYBeRg9rWt3Nu8u1pXvQp5kWYtcN4P8W7Q",
      username: "CyberLaunch",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      bio: "Web3 Hunter. Passionate about decentralized widgets, playgroups, and NFT assets.",
      balance: 12.8,
      created_at: ""
    },
    {
      id: "u3",
      wallet_address: "ARTByN8uYxt3r9WZvQP86kWAtcN2P4M9XW",
      username: "ArtByte",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bio: "Creator of generative arts & game templates. Committing builds on Solana Devnet.",
      balance: 4.5,
      created_at: ""
    }
  ].filter((v, i, self) => self.findIndex(t => t.wallet_address.toLowerCase() === v.wallet_address.toLowerCase()) === i)
   .sort((a, b) => b.balance - a.balance);

  return (
    <div id="immersive-canvas-root" className="min-h-screen bg-[#020205] text-[#f3f4f6] font-sans overflow-x-hidden relative flex flex-col cyber-bg-grid">
      
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#9945FF] opacity-[0.08] blur-[140px] rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#14F195] opacity-[0.07] blur-[150px] rounded-full animate-pulse-glow" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-[#00C2FF] opacity-[0.05] blur-[130px] rounded-full"></div>
      </div>

      {/* Verified transaction Toast Notification bubble */}
      {toastMessage && (
        <div 
          id="network-broadcast-toast"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl max-w-sm flex items-start gap-3.5 backdrop-blur-xl animate-modal-zoom ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950/90 border-[#14F195]/40 text-emerald-100 holo-glow-emerald' 
              : toastMessage.type === 'error' 
                ? 'bg-red-950/90 border-red-500/40 text-red-100'
                : 'bg-zinc-950/90 border-[#9945FF]/40 text-zinc-100 holo-glow-indigo'
          }`}
        >
          <div className="pt-0.5">
            <Info className={`h-5 w-5 shrink-0 ${toastMessage.type === 'success' ? 'text-[#14F195]' : toastMessage.type === 'error' ? 'text-red-400' : 'text-[#9945FF]'}`} />
          </div>
          <div className="text-left">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Solana Validator Status</p>
            <p className="text-xs leading-relaxed font-semibold">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* Navigation section */}
      <Header 
        walletAddress={walletAddress}
        userProfile={userProfile}
        solPrice={solPrice}
        epochNum={epochNum}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenProfile={() => {
          setShowProfileConfig(true);
          const el = document.getElementById('profile-editor-bubble');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Primary Desktop Sidebar and Main panels */}
      <div className="relative z-10 flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Left Interactive Sidebar panel */}
        <aside id="main-asymmetrical-sidebar" className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#04040a]/30 p-4 sm:p-6 flex flex-col gap-6 shrink-0 z-10">
          
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 px-2 font-display text-left">Navigation Network</p>
            <ul className="space-y-1">
              {[
                { id: 'explore', label: 'Explore Assets', icon: Compass, badge: products.length, color: 'text-[#14F195]' },
                { id: 'feed', label: 'Social Ledger Feed', icon: MessageSquare, badge: posts.length, color: 'text-[#9945FF]' },
                { id: 'launch', label: 'Launch Program', icon: PlusCircle, color: 'text-cyan-400' },
                { id: 'leaderboard', label: 'Compilers Rankings', icon: Trophy, color: 'text-yellow-400' },
                { id: 'purchases', label: 'Decrypt Vault', icon: FolderLock, badge: purchases.filter(p => p.buyer_wallet.toLowerCase() === walletAddress.toLowerCase()).length, color: 'text-emerald-400' },
              ].map((tabItem) => {
                const TabIcon = tabItem.icon;
                const isSelected = activeTab === tabItem.id;
                return (
                  <li key={tabItem.id}>
                    <button
                      id={`sidebar-tab-btn-${tabItem.id}`}
                      onClick={() => setActiveTab(tabItem.id as TabId)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-white/[0.05] border border-white/10 text-white shadow-inner holo-glow-indigo' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TabIcon className={`w-4 h-4 ${isSelected ? tabItem.color : 'opacity-50'}`} />
                        <span>{tabItem.label}</span>
                      </div>
                      {tabItem.badge !== undefined && (
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-md ${isSelected ? 'bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/20' : 'bg-white/5 border border-white/5 text-zinc-500'}`}>
                          {tabItem.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Connected Pilot Details Card */}
          <div className="mt-auto pt-4 border-t border-white/5">
            {userProfile ? (
              <div className="p-4 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#9945FF] opacity-[0.03] blur-lg rounded-full"></div>
                <div className="flex items-center gap-3 mb-3 text-left">
                  <div className="relative">
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Avatar file representation" 
                      className="w-10 h-10 rounded-full bg-zinc-950 border border-white/10 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`;
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#14F195] rounded-full border border-[#020205] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-100 truncate leading-none mb-1">{userProfile.username}</p>
                    <p className="text-[9px] font-mono text-zinc-500 truncate" title={userProfile.wallet_address}>
                      {userProfile.wallet_address.substring(0, 7)}...{userProfile.wallet_address.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-white/50 mb-3 bg-black/40 p-2.5 rounded-xl font-mono border border-white/5 text-left">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Sandbox Sol:</span>
                    <span className="text-[#14F195] font-black">{userProfile.balance.toFixed(3)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Vault Assets:</span>
                    <span className="text-white font-bold">{purchases.filter(p => p.buyer_wallet.toLowerCase() === walletAddress.toLowerCase()).length}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 text-left italic line-clamp-2 leading-relaxed mb-3">
                  {userProfile.bio || "No biography specifications registered with the public blockchain catalog."}
                </p>

                <button 
                  onClick={() => setShowProfileConfig(p => !p)}
                  className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-[#14F195] hover:text-[#9945FF] transition duration-200 cursor-pointer block pt-1"
                >
                  {showProfileConfig ? 'Hide Profile Meta' : 'Configure Persona ⚙️'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center space-y-2.5">
                <p className="text-xs text-zinc-400 leading-normal">Configure a decentralized address keyset to mint and track releases.</p>
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="px-4 py-2 bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/30 hover:border-[#9945FF] text-[10px] font-bold rounded-xl tracking-wider uppercase transition cursor-pointer"
                >
                  Open Sandbox Wallet
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Central Workspace Stage with Active Pages */}
        <main id="main-immersive-workspace-pane" className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col z-10">
          
          {/* Dynamic Configuration Form Block */}
          {showProfileConfig && userProfile && (
            <div id="profile-editor-bubble" className="bg-gradient-to-r from-purple-950/20 to-[#070712]/90 border border-[#9945FF]/30 p-6 rounded-2xl mb-8 animate-modal-zoom relative text-left">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowProfileConfig(false)} 
                  className="text-white/40 hover:text-white text-xs bg-white/5 px-2 py-1 rounded"
                >
                  ✕ Hide Form
                </button>
              </div>
              <h2 className="text-lg font-display font-medium text-white flex items-center gap-2 mb-1.5 text-[#9945FF]">
                <UserIcon className="h-5 w-5 text-[#9945FF]" /> Define Your Creative Ledger Persona
              </h2>
              <p className="text-xs text-white/50 mb-5">Configure username taglines and avatar image links to verify releases in the Explore catalog feed.</p>
              
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Minter Username</label>
                  <input 
                    type="text" 
                    required
                    value={editUsername} 
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="e.g. SolanaMage"
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-hidden focus:border-[#9945FF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Avatar Artwork URL</label>
                  <input 
                    type="url" 
                    value={editAvatar} 
                    onChange={e => setEditAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-hidden focus:border-[#9945FF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Sandbox Biography Line</label>
                  <input 
                    type="text" 
                    value={editBio} 
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="A brief tagline of your web3 outputs..."
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-[#9945FF]"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowProfileConfig(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs rounded-xl text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#9945FF] to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                  >
                    {isSavingProfile ? "Finalizing Block Transaction..." : "Save Ledger Coordinates"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: DISCOVER/EXPLORE PRODUCTS */}
          {activeTab === 'explore' && (
            <div id="tab-explore" className="flex-grow flex flex-col space-y-6">
              
              {/* Header section with promotional message */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pb-6 border-b border-white/5 shrink-0 text-left">
                <div className="space-y-1.5">
                  <h1 className="text-3xl sm:text-4xl font-display font-light italic text-white tracking-tight leading-none">
                    Decentralized <span className="text-[#14F195] font-normal font-sans">Asset Store</span>
                  </h1>
                  <p className="text-white/40 text-sm font-light">Browse, upvote, and claim premium programmatic resources deployed on Solana Devnet.</p>
                </div>

                {/* Filter list controls */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search title specs..." 
                      value={productSearchKeyword}
                      onChange={e => setProductSearchKeyword(e.target.value)}
                      className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#14F195] w-full sm:w-52 md:w-60"
                    />
                  </div>

                  <div className="flex bg-[#070712]/60 p-1 rounded-xl border border-white/5">
                    {['all', 'Templates', 'Software', 'Assets', 'Guides'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setProductCategoryFilter(cat.toLowerCase())}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          productCategoryFilter === cat.toLowerCase()
                            ? 'bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/20 font-black'
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic products catalog lists */}
              {filteredProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-center">
                  <FolderLock className="h-10 w-10 text-zinc-700 mb-3" />
                  <h3 className="text-lg font-bold text-zinc-350">No Asset Listings Found</h3>
                  <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed font-light">
                    We couldn't match items with your search filter. Create the first design asset catalog program to kickstart!
                  </p>
                  <button 
                    onClick={() => { setProductCategoryFilter('all'); setProductSearchKeyword(''); }}
                    className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer"
                  >
                    Reset Filter Fields
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      walletAddress={walletAddress}
                      userProfile={userProfile}
                      onUpvote={handleProductUpvoteSubmit}
                      onPurchase={handlePurchaseProductSubmit}
                      onSelect={(p) => setSelectedProduct(p)}
                      isPurchasing={isPurchasingId === product.id}
                      isBought={isUserBoughtProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMMUNITY SOCIAL LEDGER */}
          {activeTab === 'feed' && (
            <div id="tab-feed" className="flex-grow max-w-3xl mx-auto w-full space-y-6">
              
              <div className="pb-4 border-b border-white/5 text-left">
                <h1 className="text-3xl font-display font-light italic text-white mb-1.5 text-left">
                  Global Social <span className="text-[#9945FF] font-normal">Ledger Broadcasts</span>
                </h1>
                <p className="text-white/40 text-sm leading-relaxed text-left font-light">Broadcasting program scripts, engineering logs, or looking for collaborations in real time.</p>
              </div>

              {/* New message composer wrapper */}
              <div className="p-5 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl border border-white/5 text-left">
                <form onSubmit={handlePostCreateSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <img 
                      src={userProfile ? userProfile.avatar_url : "https://api.dicebear.com/7.x/identicon/svg?seed=guest"} 
                      alt="Your mini representative picture" 
                      className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0 bg-zinc-900"
                    />
                    <div className="flex-grow">
                      <textarea
                        required
                        rows={3}
                        value={newPostText}
                        onChange={e => setNewPostText(e.target.value)}
                        placeholder="State your building updates... (e.g. 'Just launched my sniping utility library, check explore module!')"
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#9945FF] focus:bg-[#070712]/50 transition"
                      />
                    </div>
                  </div>

                  {/* Attachment entries row */}
                  <div className="flex flex-wrap gap-2.5 items-center justify-between pl-13">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Image Artwork Link (Optional):</span>
                      <input 
                        type="url" 
                        value={newPostImage}
                        onChange={e => setNewPostImage(e.target.value)}
                        placeholder="https://..."
                        className="bg-black/60 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-zinc-300 w-44 sm:w-60 focus:outline-hidden focus:border-[#14F195]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPublishingPost || !newPostText.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#9945FF] to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      {isPublishingPost ? (
                        <>
                          <div className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full" />
                          <span>Mining Block...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 hover:translate-x-0.5 transition-transform" />
                          <span>Broadcast</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display posts collection lists */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="p-12 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl bg-[#070712]/50">
                    <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs">No active ledger broadcasts found. Initiate your first post above!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      walletAddress={walletAddress}
                      userProfile={userProfile}
                      onLike={handlePostLikeSubmit}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOY/LAUNCH FORM */}
          {activeTab === 'launch' && (
            <div id="tab-launch" className="flex-grow max-w-3xl mx-auto w-full space-y-6">
              
              <div className="pb-4 border-b border-white/5 text-left">
                <h1 className="text-3xl font-display font-light italic text-white mb-1.5 text-left">
                  Upload & Launch <span className="text-cyan-400 font-normal">On-Chain Assets</span>
                </h1>
                <p className="text-white/40 text-sm text-left font-light">Deploy high-performance designs, scripts, and software builds on the decentralized sandbox catalog.</p>
              </div>

              {/* Instructions warnings */}
              <div className="bg-gradient-to-r from-purple-950/10 to-cyan-950/20 border border-cyan-500/20 rounded-2xl p-5 flex items-start gap-4">
                <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-wider font-mono text-cyan-400">Ledger Instruction System</p>
                  <p className="text-xs text-zinc-350 leading-relaxed font-light">
                    Deploying an asset auto-generates a secure Solana program ID. Once compiled, LaunchSphere places card previews in the Social feed. Make sure to provide valid download URLs so valid purchase owners can decrypt and retrieve files safely!
                  </p>
                </div>
              </div>

              {/* Upload dynamic asset setup form */}
              <form onSubmit={handleLaunchProductSubmit} className="space-y-5 bg-[#070712]/45 p-6 rounded-2xl border border-white/5 text-left text-zinc-300">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Asset Label / Title <span className="text-[#14F195]">*</span></label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Solana Snipe Bot v1.2"
                      value={launchTitle}
                      onChange={e => setLaunchTitle(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-hidden focus:border-[#14F195]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Catalog Category <span className="text-[#14F195]">*</span></label>
                    <select
                      value={launchCategory}
                      onChange={e => setLaunchCategory(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-[#14F195] font-display"
                    >
                      <option value="Templates">Templates (Boilerplate React / Next)</option>
                      <option value="Software">Software (Rust Smart Contracts / CLI Bots)</option>
                      <option value="Assets">Assets (Design Packs / SVGs / Logos)</option>
                      <option value="Guides">Guides (Deep-dives / PDFs / Architecture)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Detailed Product Specifications</label>
                  <textarea
                    rows={4}
                    placeholder="Describe configuration instructions, code signatures, staking ratios, and deliverable items specs..."
                    value={launchDescription}
                    onChange={e => setLaunchDescription(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 focus:outline-hidden focus:border-[#14F195] font-sans font-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Deploy Pricing (SOL Co-sign value) <span className="text-[#14F195]">*</span></label>
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={launchPrice}
                        onChange={e => setLaunchPrice(Number(e.target.value))}
                        className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 pl-12 text-xs font-mono text-zinc-100 focus:outline-hidden focus:border-[#14F195]"
                      />
                      <span className="absolute left-4 top-3 text-[#14F195] font-mono text-xs font-black">SOL</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Ecosystem Search Tag List</label>
                    <input 
                      type="text"
                      placeholder="Solana, Rust, Snipe, Bot"
                      value={launchTagsString}
                      onChange={e => setLaunchTagsString(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-hidden focus:border-[#14F195]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">Asset Display Thumbnail URL</label>
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={launchThumbnail}
                      onChange={e => setLaunchThumbnail(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-[#14F195]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#14F195] mb-1.5 uppercase tracking-wider font-bold">Secure Delivery Payload Link <span className="text-[#14F195]">*</span></label>
                    <input 
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={launchFileUrl}
                      onChange={e => setLaunchFileUrl(e.target.value)}
                      className="w-full bg-black/60 border border-[#14F195]/30 rounded-xl p-3 text-xs font-mono text-[#14F195] focus:outline-hidden focus:border-[#14F195] placeholder-[#14F195]/50"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-left">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest leading-none">BLOCK DEPLOY COST:</span>
                    <span className="text-white font-mono text-xs font-semibold mt-0.5">0.002 SOL</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLaunchingProduct}
                    className="px-6 py-3 bg-gradient-to-r from-[#9945FF] to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-200 shadow-lg active:scale-95 cursor-pointer text-center"
                  >
                    {isLaunchingProduct ? (
                      <div className="flex items-center gap-1.5">
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Broadcasting Mint specs...</span>
                      </div>
                    ) : (
                      <span>Deploy to Devnet Catalog</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: LEADERBOARD ELITE METRICS */}
          {activeTab === 'leaderboard' && (
            <Leaderboard 
              leaderboardsList={leaderboardsList}
              walletAddress={walletAddress}
            />
          )}

          {/* TAB 5: VAULT STORAGE KEYS */}
          {activeTab === 'purchases' && (
            <VaultKeys 
              purchases={purchases}
              products={products}
              walletAddress={walletAddress}
              onBrowseCatalog={() => setActiveTab('explore')}
            />
          )}

          {/* Dynamic Feed ticker status strip footer */}
          <div className="mt-auto pt-8">
            <div className="p-3.5 bg-[#05050f]/80 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto text-left overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-[#14F195] px-2.5 py-0.5 bg-[#14F195]/10 border border-[#14F195]/20 animate-pulse rounded-md uppercase tracking-wider shrink-0 select-none">
                  LATEST BLOCK TX
                </span>
                <span className="h-4 w-px bg-white/10 hidden sm:block"></span>
                <p className="text-xs text-white/50 truncate italic select-none">
                  {posts.length > 0 
                    ? `@${posts[0].username} Broadcast: "${posts[0].content}"` 
                    : "@anonymous just resolved validation nodes on Solana Devnet and finalized block #49202."
                  }
                </p>
              </div>

              <div className="flex items-center gap-4 font-mono text-[9px] text-zinc-550 tracking-wider select-none">
                <span>SIMULATED TESTNET HIGH-PERF CORES DEPLOYED</span>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* MODAL WINDOWS */}
      
      {/* Wallet control modular dashboard */}
      <WalletModal 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletAddress={walletAddress}
        userProfile={userProfile}
        onConnectWallet={handleWalletConnect}
        onRefreshProfile={fetchUserData}
      />

      {/* Selected catalog item detail verification and purchase flow */}
      {selectedProduct && (
        <div id="item-inquiry-modal" className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#070712] border border-white/10 text-zinc-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-modal-zoom">
            
            {/* Modal header details */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#090918]">
              <div className="flex items-center gap-3.5 text-left">
                <div className="bg-[#14F195]/10 border border-[#14F195]/20 text-[#14F195] p-2 rounded-xl">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-zinc-100 text-base max-w-sm truncate">{selectedProduct.title}</h3>
                  <span className="text-xs text-zinc-400 font-light block leading-none mt-1">Acquire and decrypt block payload access key</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-zinc-550 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl p-2 select-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Graphics displays */}
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative shadow-inner">
                    <img 
                      src={selectedProduct.thumbnail_url} 
                      alt={selectedProduct.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/75 border border-white/10 rounded-md text-[9px] font-mono text-[#14F195]">
                      {selectedProduct.category}
                    </span>
                  </div>

                  {/* Dual stats counter widgets */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono">Ledger Rating</p>
                      <p className="text-sm font-bold text-white mt-1 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" /> {selectedProduct.upvotes} Votes
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono">Unlock Ratio</p>
                      <p className="text-sm font-bold text-[#14F195] font-mono mt-1">
                        {selectedProduct.price.toFixed(3)} SOL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specs rows and transactional triggers */}
                <div className="space-y-4 flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Minter Information</span>
                      <div className="flex items-center gap-2.5 mt-2">
                        <img 
                          src={selectedProduct.seller_avatar} 
                          alt={selectedProduct.seller_username} 
                          className="w-6.5 h-6.5 rounded-full object-cover border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedProduct.seller_wallet}`;
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{selectedProduct.seller_username}</p>
                          <p className="text-[9px] font-mono text-zinc-500 truncate max-w-[155px] mt-1">{selectedProduct.seller_wallet}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Ledger Spec Tags</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedProduct.tags.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/15 text-[10px] rounded-md font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Description Specifications</span>
                      <p className="text-xs text-zinc-350 leading-relaxed mt-1 font-light font-sans max-h-24 overflow-y-auto">
                        {selectedProduct.description || "No specifications description registered with this compilation block."}
                      </p>
                    </div>
                  </div>

                  {/* Operational transactional trigger switches */}
                  <div className="pt-4 border-t border-white/5 space-y-2.5">
                    {isUserBoughtProduct(selectedProduct.id) ? (
                      <div className="space-y-2.5">
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2.5 text-[#14F195]">
                          <CheckCircle className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold">Ownership Verified On Devnet Sandbox</p>
                            <p className="text-[10px] text-zinc-400 select-none font-light mt-0.5">Payload signature decrypt valid. Acquire files instantly below.</p>
                          </div>
                        </div>
                        <a 
                          href={selectedProduct.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] text-white font-bold text-center py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer block select-none"
                        >
                          Decrypt & Download Verified Asset Code Zip 📦
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handlePurchaseProductSubmit(selectedProduct)}
                          disabled={isPurchasingId === selectedProduct.id}
                          className="w-full bg-gradient-to-r from-[#9945FF] to-[#00C2FF] hover:brightness-110 text-white font-display font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                        >
                          {isPurchasingId === selectedProduct.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" />
                              <span>Co-sign Lock Settlement for {selectedProduct.price.toFixed(2)} SOL</span>
                            </>
                          )}
                        </button>
                        <p className="text-[9px] text-zinc-550 text-center leading-normal">
                          Requires sandbox Phantom/SOL assets; executes secure decentralized escrow swap splits.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
              
            </div>

            <div className="p-4 border-t border-white/5 bg-[#090918] text-center">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-xs text-zinc-550 hover:text-white transition cursor-pointer font-display"
              >
                Go Back to Exploration Catalog
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
