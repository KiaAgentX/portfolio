import React, { useState } from "react";
import { 
  Plus, Search, Shield, Users, Layers, Settings, Sparkles, LogOut, ChevronDown, Check, Globe
} from "lucide-react";
import { Workspace, Role, Conversation, Provider } from "../types";

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  userRole: Role;
  conversations: Conversation[];
  activeChatId: string | null;
  setActiveChatId: (id: string) => void;
  onNewThread: (provider: Provider) => void;
  subscriptionPlan: string;
  setSubscriptionPlan: (plan: string) => void;
}

export default function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  userRole,
  conversations,
  activeChatId,
  setActiveChatId,
  onNewThread,
  subscriptionPlan,
  setSubscriptionPlan
}: WorkspaceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(Role.Member);
  const [workspaceMembers, setWorkspaceMembers] = useState([
    { name: "S. Antigravity", email: "antigravity@nova.ai", role: Role.SuperAdmin },
    { name: "K. Madmax", email: "kiamadmax2026@gmail.com", role: Role.Member },
    { name: "E. Musketeer", email: "musk@nova.ai", role: Role.WorkspaceAdmin }
  ]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const filteredConversations = conversations.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setWorkspaceMembers([
      ...workspaceMembers,
      { name: inviteEmail.split("@")[0], email: inviteEmail, role: inviteRole }
    ]);
    setInviteEmail("");
    setShowInviteModal(false);
  };

  return (
    <div id="sidebar" className="w-80 bg-[#0E1322] border-r border-[#1F2943] text-gray-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1F2943] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded font-black text-white text-lg tracking-wider">
            N
          </div>
          <div>
            <h1 className="font-sans font-bold text-white tracking-wide text-sm leading-none flex items-center gap-1">
              NOVA <span className="text-[10px] text-emerald-400 font-mono">v1.0</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">MULTI-PROVIDER PORTAL</p>
          </div>
        </div>
        <div className="relative">
          <button 
            id="plan-selector"
            onClick={() => setShowPlanDropdown(!showPlanDropdown)}
            className="text-xs bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-700 text-indigo-200 px-2 py-1 rounded hover:opacity-90 flex items-center gap-1 font-mono cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            {subscriptionPlan}
          </button>
          
          {showPlanDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#182035] border border-[#2B3B5E] rounded-md shadow-xl z-50 p-1 text-sm">
              <p className="text-[10px] text-gray-400 px-2.5 py-1 font-mono uppercase tracking-wider">Select Platform Tier</p>
              {["Free", "Pro", "Team", "Enterprise"].map((plan) => (
                <button
                  key={plan}
                  onClick={() => {
                    setSubscriptionPlan(plan);
                    setShowPlanDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded flex items-center justify-between hover:bg-[#202C49] text-gray-200 font-mono text-xs cursor-pointer"
                >
                  {plan} Tier
                  {subscriptionPlan === plan && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-[#1F2943] relative">
        <button
          id="workspace-selector"
          onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          className="w-full bg-[#182035] hover:bg-[#202C49] border border-[#2B3B5E] rounded p-2 text-left flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-xs text-xs font-semibold text-white">{activeWorkspace.name}</div>
              <div className="text-[10px] text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                {activeWorkspace.role}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showWorkspaceDropdown && (
          <div className="absolute left-3 right-3 mt-1 bg-[#182035] border border-[#2B3B5E] rounded shadow-xl z-50 p-1 text-xs">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setActiveWorkspaceId(w.id);
                  setShowWorkspaceDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded flex flex-col hover:bg-[#202C49] transition-colors mb-0.5 cursor-pointer ${
                  activeWorkspace.id === w.id ? "bg-[#1E2945]" : ""
                }`}
              >
                <span className="font-semibold text-white">{w.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5">{w.role} tenant</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Users / Team Section */}
      <div className="px-3 py-2 border-b border-[#1F2943] bg-[#12182B] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-sans font-medium">Workspace Members</span>
          <span className="bg-[#1D273F] text-[10px] text-gray-300 px-1.5 py-0.2 rounded font-mono">
            {workspaceMembers.length}
          </span>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="text-[10px] text-indigo-400 hover:text-indigo-200 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          + Invite
        </button>
      </div>

      {/* New Chat Action Button */}
      <div className="p-3">
        <button
          id="btn-new-chat"
          onClick={() => onNewThread(Provider.GEMINI)}
          className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Thread
        </button>
      </div>

      {/* Search Threads */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversation history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141C31] text-xs text-white pl-8 pr-3 py-2 rounded border border-[#223153] focus:outline-none focus:border-indigo-500 placeholder-gray-500 font-mono"
          />
        </div>
      </div>

      {/* Conversations List - Paginated & Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-8 font-mono">
            No active threads found.
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full text-left p-2.5 rounded transition-all flex items-start gap-2.5 border group cursor-pointer ${
                activeChatId === chat.id 
                  ? "bg-[#1C263E] border-[#394E7A] text-white" 
                  : "bg-transparent border-transparent hover:bg-[#151D32] hover:border-[#1F2943] text-gray-300"
              }`}
            >
              <div className="mt-0.5">
                <span className={`w-2 h-2 rounded-full block ${
                  chat.provider === Provider.GEMINI ? "bg-emerald-400 animate-pulse" :
                  chat.provider === Provider.OPENAI ? "bg-[#10A37F]" :
                  chat.provider === Provider.ANTHROPIC ? "bg-orange-400" : "bg-purple-500"
                }`} title={chat.provider} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                  {chat.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-gray-400 font-mono tracking-wider">
                    {chat.modelId}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">•</span>
                  <span className="text-[9px] text-[#556992] font-mono">
                    {chat.messages.length} msg
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer System Info (Architectural Honesty: Keep very minimal and clean) */}
      <div className="p-3 border-t border-[#1F2943] bg-[#0A0D18] text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-emerald-400" />
          Region: EU-West-3
        </span>
        <span>Secure BYOK Active</span>
      </div>

      {/* Share / Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121A2E] border border-[#2B3B5E] rounded-lg p-5 w-full max-w-sm">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-emerald-400" />
              Invite Team Member to {activeWorkspace.name}
            </h3>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="engineer@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#18233C] text-xs text-white rounded border border-[#2B3C61] px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Workspace Role Mapping</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full bg-[#18233C] text-xs text-white rounded border border-[#2B3C61] px-2 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={Role.Member}>Member (Standard Workspace access)</option>
                  <option value={Role.WorkspaceAdmin}>WorkspaceAdmin (Manage workspace keys/docs)</option>
                  <option value={Role.OrgAdmin}>OrgAdmin (Manage tenant subscriptions)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-xs text-gray-400 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-xs text-white font-bold cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
