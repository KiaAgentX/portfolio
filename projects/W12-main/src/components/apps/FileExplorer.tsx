"use client";

import { useEffect, useState } from "react";
import { useOS } from "@/store/os";
import { cn } from "@/lib/utils";

interface FsNode {
  id: string;
  name: string;
  type: "folder" | "file";
  ext?: string;
  content?: string;
  children?: FsNode[];
}

const FS_KEY = "win12-vfs";

function loadFs(): FsNode {
  if (typeof window === "undefined") return { id: "root", name: "C:", type: "folder", children: [] };
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultFs();
}

function saveFs(fs: FsNode) {
  try { localStorage.setItem(FS_KEY, JSON.stringify(fs)); } catch {}
}

function defaultFs(): FsNode {
  return {
    id: "root", name: "C:", type: "folder", children: [
      { id: "u", name: "Users", type: "folder", children: [
        { id: "neo", name: "Neo", type: "folder", children: [
          { id: "doc", name: "Documents", type: "folder", children: [
            { id: "f1", name: "welcome.txt", type: "file", ext: "txt", content: "Welcome to Windows 12 PRO!" },
          ]},
          { id: "dl", name: "Downloads", type: "folder", children: [] },
          { id: "pic", name: "Pictures", type: "folder", children: [] },
        ]},
      ]},
      { id: "win", name: "Windows", type: "folder", children: [] },
      { id: "prog", name: "Program Files", type: "folder", children: [] },
    ],
  };
}

function findNodeIn(root: FsNode, path: string[]): FsNode {
  let cur = root;
  for (const part of path) {
    cur = cur.children?.find((c) => c.name === part)!;
    if (!cur) throw new Error("Path not found");
  }
  return cur;
}

export default function FileExplorer({ appId }: { appId: string }) {
  const [fs, setFs] = useState<FsNode>(loadFs);
  const [path, setPath] = useState<string[]>(["C:", "Users", "Neo"]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState<"folder" | "file" | null>(null);
  const openApp = useOS((s) => s.openApp);

  useEffect(() => { saveFs(fs); }, [fs]);

  const current = (() => {
    try { return findNodeIn(fs, path); } catch { return fs; }
  })();
  const items = current.children || [];

  const navigate = (name: string) => {
    setPath((p) => [...p, name]);
    setSelected(null);
  };
  const navigateTo = (idx: number) => {
    setPath((p) => p.slice(0, idx + 1));
    setSelected(null);
  };

  const createItem = () => {
    if (!newName.trim()) { setCreating(null); return; }
    const newFs = structuredClone(fs);
    const target = findNodeIn(newFs, path);
    target.children = target.children || [];
    if (creating === "folder") {
      target.children.push({ id: `n${Date.now()}`, name: newName, type: "folder", children: [] });
    } else {
      const ext = newName.includes(".") ? newName.split(".").pop() : "";
      target.children.push({ id: `n${Date.now()}`, name: newName, type: "file", ext, content: "" });
    }
    setFs(newFs);
    setNewName("");
    setCreating(null);
  };

  const deleteItem = (name: string) => {
    const newFs = structuredClone(fs);
    const target = findNodeIn(newFs, path);
    target.children = (target.children || []).filter((c) => c.name !== name);
    setFs(newFs);
    setSelected(null);
  };

  const openItem = (item: FsNode) => {
    if (item.type === "folder") {
      navigate(item.name);
    } else {
      openApp("notepad", { fileId: item.id, fileName: item.name, content: item.content || "" });
    }
  };

  const sidebar = [
    { icon: "🏠", label: "Home", path: ["C:", "Users", "Neo"] },
    { icon: "📄", label: "Documents", path: ["C:", "Users", "Neo", "Documents"] },
    { icon: "⬇️", label: "Downloads", path: ["C:", "Users", "Neo", "Downloads"] },
    { icon: "🖼️", label: "Pictures", path: ["C:", "Users", "Neo", "Pictures"] },
    { icon: "💻", label: "This PC", path: ["C:"] },
  ];

  return (
    <div className="flex h-full bg-black/30">
      {/* Sidebar */}
      <div className="w-44 bg-purple-950/20 border-r border-cyan-500/15 p-2 space-y-1">
        <p className="text-[10px] text-cyan-300/50 uppercase tracking-wider px-2 mb-2">Quick access</p>
        {sidebar.map((s) => (
          <button
            key={s.label}
            onClick={() => setPath(s.path)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-cyan-200/80 hover:bg-cyan-500/15 transition"
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/15 bg-black/30">
          <button onClick={() => path.length > 1 && navigateTo(path.length - 2)} className="px-2 py-1 rounded hover:bg-cyan-500/20 text-cyan-300">←</button>
          <button onClick={() => navigateTo(path.length - 1)} className="px-2 py-1 rounded hover:bg-cyan-500/20 text-cyan-300">↑</button>
          <div className="flex items-center gap-1 flex-1 px-2 py-1 bg-black/40 rounded border border-cyan-500/20 text-xs">
            {path.map((p, i) => (
              <button key={i} onClick={() => navigateTo(i)} className="hover:text-cyan-300 text-cyan-200">
                {p}{i < path.length - 1 && " ›"}
              </button>
            ))}
          </div>
          <button onClick={() => setCreating("folder")} className="neon-btn px-2 py-1 rounded text-xs">📁+</button>
          <button onClick={() => setCreating("file")} className="neon-btn px-2 py-1 rounded text-xs">📄+</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2 content-start">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              onDoubleClick={() => openItem(item)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition",
                selected === item.id ? "bg-cyan-500/25 neon-border-cyan" : "hover:bg-cyan-500/10"
              )}
            >
              <span className="text-3xl">{item.type === "folder" ? "📁" : "📄"}</span>
              <span className="text-[10px] text-cyan-100 text-center leading-tight truncate w-full">{item.name}</span>
            </div>
          ))}
          {creating && (
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg neon-border-cyan">
              <span className="text-3xl">{creating === "folder" ? "📁" : "📄"}</span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createItem()}
                onBlur={createItem}
                placeholder={creating === "folder" ? "folder" : "file.txt"}
                className="neon-input text-[10px] w-full text-center"
              />
            </div>
          )}
          {items.length === 0 && !creating && (
            <p className="col-span-full text-center text-cyan-300/40 text-xs mt-8">This folder is empty.</p>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-cyan-500/15 bg-black/30 text-[10px] text-cyan-300/60">
          <span>{items.length} items</span>
          {selected && (
            <div className="flex gap-2">
              <button onClick={() => { const item = items.find(i => i.id === selected); if (item) openItem(item); }} className="hover:text-cyan-300">Open</button>
              <button onClick={() => { const item = items.find(i => i.id === selected); if (item) deleteItem(item.name); }} className="hover:text-fuchsia-300 text-fuchsia-300">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
