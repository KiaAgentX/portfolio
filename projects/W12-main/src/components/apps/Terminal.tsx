"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOS } from "@/store/os";
import { APP_MAP, getInstallableApps } from "@/lib/apps";

interface FsNode {
  id: string;
  name: string;
  type: "folder" | "file";
  ext?: string;
  content?: string;
  children?: FsNode[];
}

interface Line {
  kind: "in" | "out" | "err" | "ok";
  text: string;
}

// In-memory virtual filesystem (persisted to localStorage for the session)
const FS_KEY = "win12-vfs";

function loadFs(): FsNode {
  if (typeof window === "undefined") return defaultFs();
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultFs();
}

function saveFs(fs: FsNode) {
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(fs));
  } catch {}
}

function defaultFs(): FsNode {
  return {
    id: "root",
    name: "C:",
    type: "folder",
    children: [
      { id: "u", name: "Users", type: "folder", children: [
        { id: "neo", name: "Neo", type: "folder", children: [
          { id: "doc", name: "Documents", type: "folder", children: [
            { id: "f1", name: "welcome.txt", type: "file", ext: "txt", content: "Welcome to Windows 12 PRO Neon Edition!\n\nType 'help' to see all commands." },
            { id: "f2", name: "readme.md", type: "file", ext: "md", content: "# Windows 12 PRO\n\n- Dark Neon Theme\n- 100+ Settings\n- Working Terminal\n- App Store\n\nEnjoy the grid. 🌌" },
          ]},
          { id: "dl", name: "Downloads", type: "folder", children: [] },
          { id: "pic", name: "Pictures", type: "folder", children: [] },
          { id: "mus", name: "Music", type: "folder", children: [] },
          { id: "desk", name: "Desktop", type: "folder", children: [] },
        ]},
      ]},
      { id: "win", name: "Windows", type: "folder", children: [
        { id: "sys", name: "System32", type: "folder", children: [] },
        { id: "cfg", name: "config.neon", type: "file", ext: "neon", content: "theme=dark-neon\naccent=cyan\nneon_intensity=80" },
      ]},
      { id: "prog", name: "Program Files", type: "folder", children: [] },
    ],
  };
}

export default function Terminal({ appId }: { appId: string }) {
  const [fs, setFs] = useState<FsNode>(loadFs);
  const [cwd, setCwd] = useState<string[]>(["C:", "Users", "Neo"]);
  const [history, setHistory] = useState<Line[]>([
    { kind: "ok", text: "Windows 12 PRO Terminal [Neon Edition]" },
    { kind: "out", text: "Type 'help' for available commands. Try: ls, cd, cat, mkdir, touch, install, neofetch" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const settings = useOS((s) => s.settings);
  const installedApps = useOS((s) => s.installedApps);
  const installApp = useOS((s) => s.installApp);

  useEffect(() => {
    saveFs(fs);
  }, [fs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const prompt = `${cwd.join("\\")}>`;

  const findNode = useCallback((path: string[]): FsNode | null => {
    let cur: FsNode = fs;
    for (const part of path) {
      if (cur.type !== "folder" || !cur.children) return null;
      const next = cur.children.find((c) => c.name === part);
      if (!next) return null;
      cur = next;
    }
    return cur;
  }, [fs]);

  const resolvePath = useCallback((arg: string): string[] | null => {
    if (!arg || arg === ".") return cwd;
    if (arg === "..") return cwd.slice(0, -1);
    if (arg === "/") return ["C:"];
    let parts: string[];
    if (arg.startsWith("C:\\") || arg.startsWith("/")) {
      parts = arg.replace(/^C:\\|^\/+/, "").split(/[\\/]/).filter(Boolean);
    } else {
      parts = [...cwd, ...arg.split(/[\\/]/).filter(Boolean)];
    }
    const resolved: string[] = [];
    for (const p of parts) {
      if (p === "..") resolved.pop();
      else if (p === ".") continue;
      else resolved.push(p);
    }
    return resolved.length ? resolved : ["C:"];
  }, [cwd]);

  const addOut = (lines: Line[]) => setHistory((h) => [...h, ...lines]);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    setHistory((h) => [...h, { kind: "in", text: `${prompt} ${cmd}` }]);
    if (!cmd) return;
    setCmdHistory((h) => [...h, cmd]);
    const [name, ...args] = cmd.split(/\s+/);

    switch (name.toLowerCase()) {
      case "help":
        addOut([
          { kind: "out", text: "Available commands:" },
          { kind: "out", text: "  help              Show this help" },
          { kind: "out", text: "  ls / dir          List files" },
          { kind: "out", text: "  cd <path>         Change directory" },
          { kind: "out", text: "  pwd               Print working directory" },
          { kind: "out", text: "  cat <file>        Print file contents" },
          { kind: "out", text: "  mkdir <name>      Create folder" },
          { kind: "out", text: "  touch <name>      Create empty file" },
          { kind: "out", text: "  echo <text>       Print text" },
          { kind: "out", text: "  rm <name>         Delete file/folder" },
          { kind: "out", text: "  mv <src> <dst>    Rename/move" },
          { kind: "out", text: "  cp <src> <dst>    Copy file" },
          { kind: "out", text: "  find <name>       Find files" },
          { kind: "out", text: "  clear / cls       Clear screen" },
          { kind: "out", text: "  date / time       Show date/time" },
          { kind: "out", text: "  whoami            Current user" },
          { kind: "out", text: "  neofetch          System info" },
          { kind: "out", text: "  install <app>     Install app from store" },
          { kind: "out", text: "  apps              List installed apps" },
          { kind: "out", text: "  open <app>        Launch an app" },
          { kind: "out", text: "  edit <file>       Open file in Notepad" },
          { kind: "out", text: "  history           Command history" },
          { kind: "out", text: "  echo $settings    Show settings" },
          { kind: "out", text: "  exit              Close terminal" },
        ]);
        break;
      case "ls":
      case "dir": {
        const target = args[0] ? resolvePath(args[0]) : cwd;
        if (!target) { addOut([{ kind: "err", text: "Invalid path" }]); break; }
        const node = findNode(target);
        if (!node) { addOut([{ kind: "err", text: `Path not found: ${args[0]}` }]); break; }
        if (node.type !== "folder") { addOut([{ kind: "out", text: node.name }]); break; }
        if (!node.children?.length) { addOut([{ kind: "out", text: "(empty)" }]); break; }
        const lines: Line[] = node.children.map((c) => ({
          kind: c.type === "folder" ? "ok" : "out",
          text: c.type === "folder" ? `📁 ${c.name}/` : `📄 ${c.name}${c.ext ? "" : ""}`,
        }));
        addOut(lines);
        break;
      }
      case "cd": {
        if (!args[0]) { setCwd(["C:", "Users", "Neo"]); break; }
        const target = resolvePath(args[0]);
        if (!target) { addOut([{ kind: "err", text: "Invalid path" }]); break; }
        const node = findNode(target);
        if (!node) { addOut([{ kind: "err", text: `Not found: ${args[0]}` }]); break; }
        if (node.type !== "folder") { addOut([{ kind: "err", text: "Not a directory" }]); break; }
        setCwd(target);
        break;
      }
      case "pwd":
        addOut([{ kind: "out", text: cwd.join("\\") }]);
        break;
      case "cat": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: cat <file>" }]); break; }
        const target = resolvePath(args[0]);
        if (!target) { addOut([{ kind: "err", text: "Invalid path" }]); break; }
        const node = findNode(target);
        if (!node) { addOut([{ kind: "err", text: `Not found: ${args[0]}` }]); break; }
        if (node.type !== "file") { addOut([{ kind: "err", text: "Is a directory" }]); break; }
        (node.content || "").split("\n").forEach((l) => addOut([{ kind: "out", text: l }]));
        break;
      }
      case "mkdir": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: mkdir <name>" }]); break; }
        const node = findNode(cwd);
        if (!node || node.type !== "folder") { addOut([{ kind: "err", text: "Cannot create here" }]); break; }
        if (node.children?.some((c) => c.name === args[0])) { addOut([{ kind: "err", text: "Already exists" }]); break; }
        const newFs = structuredClone(fs);
        const target = findNodeIn(newFs, cwd);
        target.children = target.children || [];
        target.children.push({ id: `n${Date.now()}`, name: args[0], type: "folder", children: [] });
        setFs(newFs);
        addOut([{ kind: "ok", text: `Created folder: ${args[0]}` }]);
        break;
      }
      case "touch": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: touch <name>" }]); break; }
        const newFs = structuredClone(fs);
        const target = findNodeIn(newFs, cwd);
        target.children = target.children || [];
        if (target.children.some((c) => c.name === args[0])) { addOut([{ kind: "err", text: "Already exists" }]); break; }
        const ext = args[0].includes(".") ? args[0].split(".").pop() : "";
        target.children.push({ id: `n${Date.now()}`, name: args[0], type: "file", ext, content: "" });
        setFs(newFs);
        addOut([{ kind: "ok", text: `Created file: ${args[0]}` }]);
        break;
      }
      case "echo":
        addOut([{ kind: "out", text: args.join(" ") }]);
        break;
      case "rm":
      case "del": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: rm <name>" }]); break; }
        const newFs = structuredClone(fs);
        const target = findNodeIn(newFs, cwd);
        if (!target.children) { addOut([{ kind: "err", text: "Empty folder" }]); break; }
        const idx = target.children.findIndex((c) => c.name === args[0]);
        if (idx < 0) { addOut([{ kind: "err", text: `Not found: ${args[0]}` }]); break; }
        target.children.splice(idx, 1);
        setFs(newFs);
        addOut([{ kind: "ok", text: `Deleted: ${args[0]}` }]);
        break;
      }
      case "mv": {
        if (args.length < 2) { addOut([{ kind: "err", text: "Usage: mv <src> <dst>" }]); break; }
        const newFs = structuredClone(fs);
        const target = findNodeIn(newFs, cwd);
        const node = target.children?.find((c) => c.name === args[0]);
        if (!node) { addOut([{ kind: "err", text: `Not found: ${args[0]}` }]); break; }
        node.name = args[1];
        setFs(newFs);
        addOut([{ kind: "ok", text: `Renamed: ${args[0]} → ${args[1]}` }]);
        break;
      }
      case "cp": {
        if (args.length < 2) { addOut([{ kind: "err", text: "Usage: cp <src> <dst>" }]); break; }
        const newFs = structuredClone(fs);
        const target = findNodeIn(newFs, cwd);
        const node = target.children?.find((c) => c.name === args[0]);
        if (!node) { addOut([{ kind: "err", text: `Not found: ${args[0]}` }]); break; }
        target.children!.push({ ...structuredClone(node), id: `n${Date.now()}`, name: args[1] });
        setFs(newFs);
        addOut([{ kind: "ok", text: `Copied: ${args[0]} → ${args[1]}` }]);
        break;
      }
      case "find": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: find <name>" }]); break; }
        const results: string[] = [];
        const walk = (n: FsNode, path: string) => {
          if (n.name.toLowerCase().includes(args[0].toLowerCase())) results.push(`${path}/${n.name}`);
          n.children?.forEach((c) => walk(c, `${path}/${n.name}`));
        };
        walk(fs, "");
        if (results.length === 0) addOut([{ kind: "out", text: "No matches." }]);
        else results.forEach((r) => addOut([{ kind: "out", text: r }]));
        break;
      }
      case "clear":
      case "cls":
        setHistory([]);
        break;
      case "date":
        addOut([{ kind: "out", text: new Date().toLocaleDateString() }]);
        break;
      case "time":
        addOut([{ kind: "out", text: new Date().toLocaleTimeString() }]);
        break;
      case "whoami":
        addOut([{ kind: "out", text: settings.userName.toLowerCase() }]);
        break;
      case "neofetch":
        addOut([
          { kind: "ok", text: "        ⬢⬢⬢⬢⬢         " },
          { kind: "ok", text: "      ⬢⬢⬢⬢⬢⬢⬢       " },
          { kind: "ok", text: "     ⬢⬢⬢⬢⬢⬢⬢⬢      " },
          { kind: "out", text: `${settings.userName}@${settings.computerName}` },
          { kind: "out", text: "─────────────────────" },
          { kind: "out", text: `OS: Windows 12 PRO (Neon)` },
          { kind: "out", text: `Host: ${settings.computerName}` },
          { kind: "out", text: `Kernel: Neon-NT 12.0.4` },
          { kind: "out", text: `Shell: neon-sh 2.0` },
          { kind: "out", text: `Resolution: ${settings.resolution}` },
          { kind: "out", text: `DE: Neon Desktop` },
          { kind: "out", text: `WM: NeonWM` },
          { kind: "out", text: `Theme: Dark Neon` },
          { kind: "out", text: `CPU: 16-core @ 5.2GHz` },
          { kind: "out", text: `GPU: RTX-Neon` },
          { kind: "out", text: `Memory: 32 GB DDR5` },
          { kind: "out", text: `Disk: ${settings.virtualMemory} MB virtual` },
          { kind: "out", text: `Apps installed: ${installedApps.length}` },
          { kind: "out", text: `Uptime: ${Math.floor(performance.now() / 1000)}s` },
        ]);
        break;
      case "apps": {
        const list = [
          ...APP_REGISTRY_BUILTIN(),
          ...getInstallableApps().filter((a) => installedApps.includes(a.id)),
        ];
        addOut([{ kind: "out", text: "Installed apps:" }]);
        list.forEach((a) => addOut([{ kind: "out", text: `  ${a.icon} ${a.id.padEnd(12)} ${a.name}` }]));
        break;
      }
      case "install": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: install <app-id>. Try: install music" }]); break; }
        const avail = getInstallableApps();
        const target = avail.find((a) => a.id === args[0].toLowerCase() || a.name.toLowerCase().includes(args[0].toLowerCase()));
        if (!target) { addOut([{ kind: "err", text: `App not found in store: ${args[0]}` }]); break; }
        if (installedApps.includes(target.id)) { addOut([{ kind: "out", text: `${target.name} is already installed.` }]); break; }
        installApp(target.id);
        addOut([
          { kind: "ok", text: `Installing ${target.name}...` },
          { kind: "out", text: `  Downloading package...` },
          { kind: "out", text: `  Extracting files...` },
          { kind: "out", text: `  Creating desktop shortcut...` },
          { kind: "ok", text: `✓ ${target.name} installed successfully!` },
          { kind: "out", text: `Type 'open ${target.id}' to launch it.` },
        ]);
        break;
      }
      case "open": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: open <app-id>" }]); break; }
        const target = APP_MAP[args[0].toLowerCase()];
        if (!target) { addOut([{ kind: "err", text: `Unknown app: ${args[0]}` }]); break; }
        if (!target.builtIn && !installedApps.includes(target.id)) {
          addOut([{ kind: "err", text: `${target.name} is not installed. Run: install ${target.id}` }]);
          break;
        }
        useOS.getState().openApp(target.id);
        addOut([{ kind: "ok", text: `Launching ${target.name}...` }]);
        break;
      }
      case "edit": {
        if (!args[0]) { addOut([{ kind: "err", text: "Usage: edit <file>" }]); break; }
        const target = resolvePath(args[0]);
        if (!target) { addOut([{ kind: "err", text: "Invalid path" }]); break; }
        const node = findNode(target);
        if (!node || node.type !== "file") { addOut([{ kind: "err", text: "File not found" }]); break; }
        useOS.getState().openApp("notepad", { fileId: node.id, fileName: node.name, content: node.content || "" });
        addOut([{ kind: "ok", text: `Opening ${node.name} in Notepad...` }]);
        break;
      }
      case "history":
        cmdHistory.forEach((c, i) => addOut([{ kind: "out", text: `${(i + 1).toString().padStart(3)}  ${c}` }]));
        break;
      case "exit":
        addOut([{ kind: "out", text: "Use the ✕ button to close." }]);
        break;
      case "echo":
        addOut([{ kind: "out", text: args.join(" ") }]);
        break;
      default:
        addOut([{ kind: "err", text: `'${name}' is not recognized. Type 'help'.` }]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
      setHistIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const idx = histIdx < 0 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= cmdHistory.length) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(idx); setInput(cmdHistory[idx]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // simple autocomplete
      const node = findNode(cwd);
      const matches = node?.children?.filter((c) => c.name.startsWith(input.split(/\s+/).pop() || "")) || [];
      if (matches.length === 1) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = matches[0].name + (matches[0].type === "folder" ? "\\" : "");
        setInput(parts.join(" "));
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <div
      className="h-full w-full bg-black/85 text-cyan-300 font-mono text-[13px] p-3 overflow-y-auto"
      onClick={() => inputRef.current?.focus()}
      style={{ filter: `brightness(${settings.brightness / 100 + 0.2})` }}
    >
      {history.map((l, i) => (
        <div
          key={i}
          className={
            l.kind === "in" ? "text-cyan-100" :
            l.kind === "err" ? "text-fuchsia-400" :
            l.kind === "ok" ? "text-emerald-300" :
            "text-cyan-300/90"
          }
        >
          {l.text || " "}
        </div>
      ))}
      <div className="flex items-center gap-1">
        <span className="text-cyan-400">{prompt}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none text-cyan-100 caret-cyan-400"
          spellCheck={false}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

function findNodeIn(root: FsNode, path: string[]): FsNode {
  let cur = root;
  for (const part of path) {
    cur = cur.children?.find((c) => c.name === part)!;
    if (!cur) throw new Error("Path not found");
  }
  return cur;
}

function APP_REGISTRY_BUILTIN() {
  return Object.values(APP_MAP).filter((a) => a.builtIn);
}
