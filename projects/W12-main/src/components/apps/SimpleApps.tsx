"use client";

import { useEffect, useRef, useState } from "react";
import { useOS } from "@/store/os";
import { cn } from "@/lib/utils";

/* ============ Notepad ============ */
export function Notepad({ appId }: { appId: string }) {
  const payload = useOS((s) => s.windows.find((w) => w.appId === appId)?.payload);
  const [text, setText] = useState<string>((payload?.content as string) || "");
  const [name, setName] = useState<string>((payload?.fileName as string) || "untitled.txt");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (payload?.content !== undefined) {
      setText((payload.content as string) || "");
      setName((payload.fileName as string) || "untitled.txt");
    }
  }, [payload]);

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 800);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/20 bg-black/30">
        <input value={name} onChange={(e) => setName(e.target.value)} className="neon-input text-xs flex-1" />
        <span className="text-[10px] text-cyan-300/50">{text.length} chars · {text.split(/\s+/).filter(Boolean).length} words</span>
        <span className={cn("text-[10px]", saved ? "text-emerald-400" : "text-fuchsia-400")}>{saved ? "✓ Saved" : "● Editing"}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-transparent text-cyan-100 font-mono text-sm p-3 outline-none resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
}

/* ============ Calculator ============ */
export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (d: string) => {
    if (fresh) { setDisplay(d === "." ? "0." : d); setFresh(false); }
    else setDisplay((s) => (d === "." && s.includes(".")) ? s : s + d);
  };
  const applyOp = (nextOp: string) => {
    const val = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const result = compute(prev, val, op);
      setHistory((h) => [`${prev} ${op} ${val} = ${result}`, ...h].slice(0, 8));
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(val);
    }
    setOp(nextOp);
    setFresh(true);
  };
  const compute = (a: number, b: number, o: string) => {
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      case "^": return Math.pow(a, b);
      default: return b;
    }
  };
  const equals = () => {
    if (prev === null || op === null) return;
    const val = parseFloat(display);
    const result = compute(prev, val, op);
    setHistory((h) => [`${prev} ${op} ${val} = ${result}`, ...h].slice(0, 8));
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };
  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); };
  const pct = () => setDisplay(String(parseFloat(display) / 100));
  const neg = () => setDisplay(String(-parseFloat(display)));

  const btn = (label: string, onClick: () => void, cls = "") => (
    <button onClick={onClick} className={cn("rounded-lg font-semibold text-lg transition hover:scale-105", cls)}>{label}</button>
  );

  return (
    <div className="flex flex-col h-full bg-black/50 p-3 gap-2">
      <div className="bg-black/60 rounded-lg p-4 text-right neon-border-cyan">
        <div className="text-[10px] text-cyan-300/40 h-4">{prev !== null && op ? `${prev} ${op}` : ""}</div>
        <div className="text-4xl font-bold neon-text-cyan tabular-nums truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {btn("C", clear, "bg-fuchsia-500/20 text-fuchsia-200 hover:bg-fuchsia-500/40 col-span-2")}
        {btn("±", neg, "bg-purple-500/20 text-purple-200 hover:bg-purple-500/40")}
        {btn("÷", () => applyOp("÷"), "bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/50")}
        {btn("7", () => inputDigit("7"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("8", () => inputDigit("8"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("9", () => inputDigit("9"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("×", () => applyOp("×"), "bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/50")}
        {btn("4", () => inputDigit("4"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("5", () => inputDigit("5"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("6", () => inputDigit("6"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("−", () => applyOp("−"), "bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/50")}
        {btn("1", () => inputDigit("1"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("2", () => inputDigit("2"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("3", () => inputDigit("3"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("+", () => applyOp("+"), "bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/50")}
        {btn("%", pct, "bg-purple-500/20 text-purple-200 hover:bg-purple-500/40")}
        {btn("0", () => inputDigit("0"), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn(".", () => inputDigit("."), "bg-black/40 text-cyan-100 hover:bg-cyan-500/20")}
        {btn("=", equals, "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:neon-glow")}
      </div>
      {history.length > 0 && (
        <div className="bg-black/40 rounded-lg p-2 max-h-24 overflow-y-auto text-[10px] text-cyan-300/60 font-mono space-y-0.5">
          {history.map((h, i) => <div key={i}>{h}</div>)}
        </div>
      )}
    </div>
  );
}

/* ============ Browser ============ */
export function Browser() {
  const [url, setUrl] = useState("https://www.wikipedia.org");
  const [input, setInput] = useState(url);
  const [loading, setLoading] = useState(false);
  const go = (u: string) => {
    let target = u.trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.includes(".") && !target.includes(" ")) target = "https://" + target;
      else target = "https://duckduckgo.com/?q=" + encodeURIComponent(target);
    }
    setUrl(target);
    setInput(target);
    setLoading(true);
  };
  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="flex items-center gap-2 p-2 border-b border-cyan-500/20 bg-black/30">
        <button onClick={() => go(url)} className="px-2 text-cyan-300 hover:text-cyan-100">←</button>
        <button onClick={() => go(url)} className="px-2 text-cyan-300 hover:text-cyan-100">→</button>
        <button onClick={() => go(url)} className="px-2 text-cyan-300 hover:text-cyan-100">⟳</button>
        <form onSubmit={(e) => { e.preventDefault(); go(input); }} className="flex-1 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="neon-input flex-1 text-xs"
            placeholder="Search or enter URL..."
          />
        </form>
        <span className="text-[10px] text-cyan-300/50 px-2">🔒 Secure</span>
      </div>
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500/40 overflow-hidden z-10">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
        <iframe
          src={url}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="browser"
        />
      </div>
    </div>
  );
}

/* ============ Paint ============ */
export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#00f0ff");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#05060d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * canvasRef.current!.width, y: ((e.clientY - r.top) / r.height) * canvasRef.current!.height };
  };
  const start = (e: React.PointerEvent) => { drawing.current = true; last.current = pos(e); };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = tool === "eraser" ? "#05060d" : color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; last.current = null; };
  const clear = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.fillStyle = "#05060d";
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };
  const colors = ["#00f0ff", "#ff2bd6", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#ffffff"];
  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="flex items-center gap-2 p-2 border-b border-cyan-500/20 bg-black/30">
        <div className="flex gap-1">
          {colors.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool("brush"); }} className={cn("w-6 h-6 rounded-full border-2", color === c ? "border-white" : "border-transparent")} style={{ background: c }} />
          ))}
        </div>
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("brush"); }} className="w-8 h-8 rounded" />
        <input type="range" min={1} max={30} value={size} onChange={(e) => setSize(+e.target.value)} className="neon-range w-24" />
        <span className="text-[10px] text-cyan-300/60">{size}px</span>
        <button onClick={() => setTool("brush")} className={cn("px-2 py-1 rounded text-xs", tool === "brush" ? "neon-border-cyan" : "bg-black/40")}>🖌 Brush</button>
        <button onClick={() => setTool("eraser")} className={cn("px-2 py-1 rounded text-xs", tool === "eraser" ? "neon-border-cyan" : "bg-black/40")}>🧽 Eraser</button>
        <button onClick={clear} className="ml-auto neon-btn px-2 py-1 rounded text-xs">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="flex-1 w-full bg-black cursor-crosshair touch-none"
      />
    </div>
  );
}

/* ============ Clock ============ */
export function Clock() {
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState<"clock" | "timer" | "stopwatch">("clock");
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInput, setTimerInput] = useState(60);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!swRunning) return;
    const t = setInterval(() => setSwTime((s) => s + 10), 10);
    return () => clearInterval(t);
  }, [swRunning]);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const cities = [
    { name: "Local", offset: -now.getTimezoneOffset() / 60 },
    { name: "New York", offset: -5 },
    { name: "London", offset: 0 },
    { name: "Tokyo", offset: 9 },
    { name: "Sydney", offset: 11 },
  ];
  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="flex border-b border-cyan-500/20">
        {(["clock", "timer", "stopwatch"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-2 text-xs capitalize", tab === t ? "bg-cyan-500/20 neon-text-cyan border-b-2 border-cyan-400" : "text-cyan-300/60")}>{t}</button>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {tab === "clock" && (
          <div className="space-y-4 w-full">
            <div className="text-center">
              <div className="text-5xl font-black tabular-nums neon-text-cyan">{now.toLocaleTimeString()}</div>
              <div className="text-cyan-300/70 mt-2">{now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div className="space-y-2">
              {cities.map((c) => {
                const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                const local = new Date(utc + c.offset * 3600000);
                return (
                  <div key={c.name} className="flex justify-between items-center p-2 rounded bg-black/30 border border-cyan-500/10">
                    <span className="text-xs text-cyan-200">{c.name}</span>
                    <span className="text-sm tabular-nums text-cyan-100">{local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "stopwatch" && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-black tabular-nums neon-text-magenta">{fmt(swTime)}</div>
            <div className="flex gap-2">
              <button onClick={() => setSwRunning(!swRunning)} className="neon-btn px-6 py-2 rounded-lg">{swRunning ? "Pause" : "Start"}</button>
              <button onClick={() => { setSwRunning(false); setSwTime(0); }} className="px-6 py-2 rounded-lg bg-black/40 text-cyan-300 hover:bg-fuchsia-500/20">Reset</button>
            </div>
          </div>
        )}
        {tab === "timer" && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-black tabular-nums neon-text-purple">{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</div>
            <input type="number" value={timerInput} onChange={(e) => setTimerInput(+e.target.value)} className="neon-input w-32 text-center" placeholder="Seconds" />
            <div className="flex gap-2">
              <button onClick={() => setTimer(timerInput)} className="neon-btn px-6 py-2 rounded-lg">Start</button>
              <button onClick={() => setTimer(0)} className="px-6 py-2 rounded-lg bg-black/40 text-cyan-300 hover:bg-fuchsia-500/20">Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Calendar ============ */
export function Calendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState("");

  const y = date.getFullYear(), m = date.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const key = (d: number) => `${y}-${m}-${d}`;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <div className="flex flex-col h-full bg-black/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setDate(new Date(y, m - 1, 1))} className="px-3 py-1 rounded hover:bg-cyan-500/20 text-cyan-300">←</button>
        <h2 className="text-lg font-bold neon-text-cyan">{date.toLocaleDateString([], { month: "long", year: "numeric" })}</h2>
        <button onClick={() => setDate(new Date(y, m + 1, 1))} className="px-3 py-1 rounded hover:bg-cyan-500/20 text-cyan-300">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] text-cyan-300/60 uppercase">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: first }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const k = key(d);
          const evs = events[k] || [];
          return (
            <button
              key={d}
              onClick={() => setSelected(k)}
              className={cn(
                "aspect-square rounded-lg p-1 text-xs flex flex-col items-start transition relative",
                k === todayKey ? "neon-border-cyan" : "bg-black/30 hover:bg-cyan-500/15",
                selected === k && "ring-2 ring-cyan-400"
              )}
            >
              <span className={cn("font-semibold", k === todayKey ? "neon-text-cyan" : "text-cyan-200")}>{d}</span>
              {evs.length > 0 && <span className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">{evs.slice(0, 3).map((_, i) => <span key={i} className="w-1 h-1 rounded-full bg-fuchsia-400" />)}</span>}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-3 p-3 rounded-lg bg-black/40 border border-cyan-500/20">
          <div className="flex gap-2 mb-2">
            <input value={newEvent} onChange={(e) => setNewEvent(e.target.value)} placeholder="Add event..." className="neon-input flex-1 text-xs" />
            <button onClick={() => { if (newEvent) { setEvents((e) => ({ ...e, [selected]: [...(e[selected] || []), newEvent] })); setNewEvent(""); } }} className="neon-btn px-3 py-1 rounded text-xs">Add</button>
          </div>
          <div className="space-y-1">
            {(events[selected] || []).map((ev, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-cyan-100 bg-cyan-500/10 px-2 py-1 rounded">
                <span>{ev}</span>
                <button onClick={() => setEvents((e) => ({ ...e, [selected]: e[selected].filter((_, j) => j !== i) }))} className="text-fuchsia-300">✕</button>
              </div>
            ))}
            {(!events[selected] || events[selected].length === 0) && <p className="text-[10px] text-cyan-300/40">No events.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Music ============ */
export function Music() {
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const tracks = [
    { title: "Neon Dreams", artist: "Synthwave Kid", dur: 215 },
    { title: "Cyber Sunset", artist: "Grid Runner", dur: 198 },
    { title: "Hologram", artist: "Voltage", dur: 243 },
    { title: "Digital Love", artist: "Pulsewave", dur: 187 },
    { title: "Midnight Drive", artist: "Retrowave", dur: 267 },
  ];
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress((p) => (p >= tracks[track].dur ? 0 : p + 1)), 1000);
    return () => clearInterval(t);
  }, [playing, track]);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="flex flex-col h-full bg-black/50 p-4">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className={cn("w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-6xl neon-glow", playing && "animate-pulse-glow")}>🎵</div>
        <div className="text-center">
          <h3 className="text-lg font-bold neon-text-cyan">{tracks[track].title}</h3>
          <p className="text-xs text-cyan-300/60">{tracks[track].artist}</p>
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-cyan-300/60 mb-1">
          <span>{fmt(progress)}</span><span>{fmt(tracks[track].dur)}</span>
        </div>
        <input type="range" min={0} max={tracks[track].dur} value={progress} onChange={(e) => setProgress(+e.target.value)} className="neon-range w-full" />
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button onClick={() => { setTrack((t) => (t - 1 + tracks.length) % tracks.length); setProgress(0); }} className="text-2xl text-cyan-300 hover:text-cyan-100">⏮</button>
        <button onClick={() => setPlaying(!playing)} className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-2xl neon-glow">{playing ? "⏸" : "▶"}</button>
        <button onClick={() => { setTrack((t) => (t + 1) % tracks.length); setProgress(0); }} className="text-2xl text-cyan-300 hover:text-cyan-100">⏭</button>
      </div>
      <div className="mt-4 space-y-1 max-h-32 overflow-y-auto">
        {tracks.map((t, i) => (
          <button key={i} onClick={() => { setTrack(i); setProgress(0); }} className={cn("w-full flex justify-between p-2 rounded text-xs", i === track ? "bg-cyan-500/20 neon-text-cyan" : "hover:bg-cyan-500/10 text-cyan-200/70")}>
            <span>{t.title}</span><span className="text-cyan-300/50">{fmt(t.dur)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Photos ============ */
export function Photos() {
  const photos = [
    { emoji: "🌆", label: "Neon City", color: "from-purple-600 to-cyan-500" },
    { emoji: "🌌", label: "Galaxy", color: "from-indigo-600 to-purple-500" },
    { emoji: "🌊", label: "Ocean", color: "from-blue-500 to-cyan-400" },
    { emoji: "🌅", label: "Sunset", color: "from-orange-500 to-pink-500" },
    { emoji: "🏔️", label: "Mountain", color: "from-slate-500 to-blue-500" },
    { emoji: "🌃", label: "Night City", color: "from-fuchsia-600 to-purple-600" },
    { emoji: "🌠", label: "Stars", color: "from-indigo-500 to-fuchsia-500" },
    { emoji: "🎆", label: "Fireworks", color: "from-amber-500 to-fuchsia-500" },
  ];
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="flex flex-col h-full bg-black/50 p-4">
      <h2 className="text-sm font-bold neon-text-cyan mb-3">🖼️ Photo Gallery</h2>
      {selected !== null ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className={cn("w-64 h-64 rounded-2xl bg-gradient-to-br flex items-center justify-center text-8xl neon-glow", photos[selected].color)}>{photos[selected].emoji}</div>
          <p className="neon-text-cyan">{photos[selected].label}</p>
          <button onClick={() => setSelected(null)} className="neon-btn px-4 py-2 rounded-lg text-xs">← Back to gallery</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 overflow-y-auto">
          {photos.map((p, i) => (
            <button key={i} onClick={() => setSelected(i)} className={cn("aspect-square rounded-xl bg-gradient-to-br flex items-center justify-center text-4xl hover:neon-glow transition", p.color)}>
              {p.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Code Editor ============ */
export function CodeEditor() {
  const [code, setCode] = useState(`// Welcome to NeonCode\nfunction neonGreet(name) {\n  return \`Hello, \${name}! Welcome to the grid.\`;\n}\n\nconsole.log(neonGreet("Neo"));\nconsole.log("Windows 12 PRO — Neon Edition");\n`);
  const [output, setOutput] = useState<string[]>([]);
  const run = () => {
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.map(String).join(" "));
    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
      setOutput(logs.length ? logs : ["(no output)"]);
    } catch (e) {
      setOutput(["Error: " + String(e)]);
    }
    console.log = origLog;
  };
  return (
    <div className="flex flex-col h-full bg-black/60">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/20 bg-black/40">
        <span className="text-xs text-cyan-300">💻 NeonCode</span>
        <span className="text-[10px] text-cyan-300/50">main.js</span>
        <button onClick={run} className="ml-auto neon-btn px-3 py-1 rounded text-xs">▶ Run</button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} className="flex-1 bg-transparent text-cyan-100 font-mono text-xs p-3 outline-none resize-none" />
        <div className="w-1/3 border-l border-cyan-500/20 bg-black/40 p-3 overflow-y-auto font-mono text-[11px]">
          <p className="text-cyan-300/50 mb-2">// Output</p>
          {output.map((l, i) => <div key={i} className="text-emerald-300">{l}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ============ Weather ============ */
export function Weather() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const icons = ["☀️", "⛅", "🌧️", "⛅", "☀️", "🌤️", "🌈"];
  const temps = [22, 18, 15, 19, 24, 21, 26];
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-950/40 to-cyan-950/30 p-4">
      <div className="text-center mb-4">
        <p className="text-cyan-300/60 text-xs">San Francisco, CA</p>
        <div className="text-7xl my-2">⛅</div>
        <div className="text-5xl font-black neon-text-cyan">19°</div>
        <p className="text-cyan-300/70 text-sm">Partly Cloudy</p>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-4">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/30 border border-cyan-500/10">
            <span className="text-[10px] text-cyan-300/60">{d}</span>
            <span className="text-2xl">{icons[i]}</span>
            <span className="text-xs text-cyan-100">{temps[i]}°</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: "Humidity", val: "65%" },
          { label: "Wind", val: "12 km/h" },
          { label: "UV Index", val: "3" },
          { label: "Pressure", val: "1013 hPa" },
        ].map((s) => (
          <div key={s.label} className="flex justify-between p-2 rounded bg-black/30 border border-cyan-500/10">
            <span className="text-[10px] text-cyan-300/60">{s.label}</span>
            <span className="text-xs text-cyan-100">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Mail ============ */
export function Mail() {
  const [selected, setSelected] = useState(0);
  const emails = [
    { from: "neon@system.pc", subject: "Welcome to Windows 12 PRO", body: "Your neon desktop is ready. Explore 100+ settings, install apps from the store, and enjoy the grid.", time: "9:42" },
    { from: "store@neon.pc", subject: "New apps available", body: "Check out Neon Beats, NeonCode, and more in the Neon Store. One-click install with desktop shortcuts.", time: "8:15" },
    { from: "security@neon.pc", subject: "Firewall enabled", body: "Your system is protected. Firewall and antivirus are active.", time: "Yesterday" },
    { from: "updates@neon.pc", subject: "System update ready", body: "Windows 12 PRO build 12.0.4 is ready to install. Features improved neon rendering.", time: "2 days ago" },
  ];
  return (
    <div className="flex h-full bg-black/50">
      <div className="w-1/3 border-r border-cyan-500/20 overflow-y-auto">
        {emails.map((e, i) => (
          <button key={i} onClick={() => setSelected(i)} className={cn("w-full text-left p-3 border-b border-cyan-500/10 transition", selected === i ? "bg-cyan-500/20" : "hover:bg-cyan-500/10")}>
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-cyan-100 truncate">{e.from}</span>
              <span className="text-[10px] text-cyan-300/50">{e.time}</span>
            </div>
            <p className="text-xs text-cyan-200 truncate">{e.subject}</p>
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-sm font-bold neon-text-cyan mb-1">{emails[selected].subject}</h2>
        <p className="text-[10px] text-cyan-300/60 mb-3">From: {emails[selected].from} · {emails[selected].time}</p>
        <p className="text-xs text-cyan-100 leading-relaxed">{emails[selected].body}</p>
      </div>
    </div>
  );
}

/* ============ Chat ============ */
export function Chat() {
  const [messages, setMessages] = useState<{ from: "me" | "bot"; text: string }[]>([
    { from: "bot", text: "Hey! Welcome to NeonChat. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { from: "me", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      const responses = ["Interesting! Tell me more.", "I see. 🤔", "That's neon-cool!", "Got it. Anything else?", "The grid hears you.", "Affirmative.", "✨"];
      setMessages((m) => [...m, { from: "bot", text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 600);
  };
  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="p-3 border-b border-cyan-500/20 bg-black/30">
        <span className="text-sm font-bold neon-text-cyan">💬 NeonChat</span>
        <span className="text-[10px] text-emerald-400 ml-2">● Online</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[70%] px-3 py-2 rounded-2xl text-xs", m.from === "me" ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white" : "bg-black/50 border border-cyan-500/20 text-cyan-100")}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-cyan-500/20 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." className="neon-input flex-1 text-xs" />
        <button onClick={send} className="neon-btn px-4 rounded-lg text-xs">Send</button>
      </div>
    </div>
  );
}

/* ============ Games (Snake) ============ */
export function Games() {
  const [snake, setSnake] = useState<number[][]>([[10, 10]]);
  const [food, setFood] = useState<number[]>([5, 5]);
  const [dir, setDir] = useState<number[]>([1, 0]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const SIZE = 20;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const next = [head[0] + dir[0], head[1] + dir[1]];
        if (next[0] < 0 || next[0] >= SIZE || next[1] < 0 || next[1] >= SIZE || prev.some((s) => s[0] === next[0] && s[1] === next[1])) {
          setRunning(false); setGameOver(true); return prev;
        }
        const newSnake = [next, ...prev];
        if (next[0] === food[0] && next[1] === food[1]) {
          setScore((s) => s + 10);
          setFood([Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)]);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(t);
  }, [running, dir, food]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number[]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const nd = map[e.key];
      if (nd && (nd[0] !== -dir[0] || nd[1] !== -dir[1])) setDir(nd);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dir]);

  const reset = () => { setSnake([[10, 10]]); setFood([5, 5]); setDir([1, 0]); setScore(0); setGameOver(false); setRunning(true); };

  return (
    <div className="flex flex-col h-full bg-black/50 p-4 items-center justify-center gap-4">
      <div className="flex justify-between w-full max-w-xs">
        <span className="text-xs neon-text-cyan">🎮 Snake</span>
        <span className="text-xs text-cyan-300">Score: {score}</span>
      </div>
      <div className="relative bg-black/60 neon-border-cyan p-2 rounded">
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${SIZE}, 12px)`, gridTemplateRows: `repeat(${SIZE}, 12px)` }}>
          {Array.from({ length: SIZE * SIZE }).map((_, i) => {
            const x = i % SIZE, y = Math.floor(i / SIZE);
            const isHead = snake[0][0] === x && snake[0][1] === y;
            const isBody = snake.some((s) => s[0] === x && s[1] === y);
            const isFood = food[0] === x && food[1] === y;
            return <div key={i} className={cn("w-3 h-3", isHead ? "bg-cyan-400 neon-glow" : isBody ? "bg-cyan-600" : isFood ? "bg-fuchsia-500 rounded-full" : "")} />;
          })}
        </div>
        {(gameOver || !running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded">
            <p className="text-cyan-300 mb-3">{gameOver ? "Game Over!" : "Ready?"}</p>
            <button onClick={reset} className="neon-btn px-6 py-2 rounded-lg">{gameOver ? "Restart" : "Start"}</button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-cyan-300/50">Use arrow keys to move</p>
    </div>
  );
}

/* ============ Maps ============ */
export function Maps() {
  return (
    <div className="flex flex-col h-full bg-black/50">
      <div className="p-2 border-b border-cyan-500/20 bg-black/30 flex gap-2">
        <input placeholder="Search location..." className="neon-input flex-1 text-xs" />
        <button className="neon-btn px-3 rounded text-xs">Search</button>
      </div>
      <div className="flex-1 relative neon-grid overflow-hidden" style={{ background: "linear-gradient(135deg, #05060d, #0a0e1f)" }}>
        {/* Fake map grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M 0 150 Q 100 100 200 150 T 400 150" stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 50 0 L 50 300 M 150 0 L 150 300 M 250 0 L 250 300 M 350 0 L 350 300" stroke="#a855f7" strokeWidth="0.5" opacity="0.3" />
          <path d="M 0 50 L 400 50 M 0 150 L 400 150 M 0 250 L 400 250" stroke="#a855f7" strokeWidth="0.5" opacity="0.3" />
          <circle cx="200" cy="150" r="8" fill="#ff2bd6" className="animate-pulse" />
          <circle cx="200" cy="150" r="20" fill="none" stroke="#ff2bd6" strokeWidth="1" opacity="0.5" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-xs text-cyan-100 neon-text-cyan">You are here</p>
          <p className="text-[10px] text-cyan-300/60">37.7749° N, 122.4194° W</p>
        </div>
      </div>
    </div>
  );
}

/* ============ Sticky Notes ============ */
export function Notes() {
  const [notes, setNotes] = useState<{ id: string; text: string; color: string }[]>([
    { id: "1", text: "Welcome to Sticky Notes!\nClick + to add a note.", color: "from-yellow-500/30 to-amber-500/30" },
  ]);
  const colors = ["from-yellow-500/30 to-amber-500/30", "from-cyan-500/30 to-blue-500/30", "from-fuchsia-500/30 to-pink-500/30", "from-emerald-500/30 to-green-500/30"];
  return (
    <div className="flex flex-col h-full bg-black/50 p-3">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold neon-text-cyan">🗒️ Sticky Notes</span>
        <button onClick={() => setNotes((n) => [...n, { id: String(Date.now()), text: "", color: colors[n.length % colors.length] }])} className="neon-btn px-3 py-1 rounded text-xs">+ New</button>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
        {notes.map((n) => (
          <div key={n.id} className={cn("bg-gradient-to-br p-2 rounded-lg border border-cyan-500/20 flex flex-col", n.color)}>
            <button onClick={() => setNotes((ns) => ns.filter((x) => x.id !== n.id))} className="self-end text-fuchsia-300 text-xs hover:text-fuchsia-200">✕</button>
            <textarea value={n.text} onChange={(e) => setNotes((ns) => ns.map((x) => x.id === n.id ? { ...x, text: e.target.value } : x))} className="flex-1 bg-transparent text-cyan-100 text-xs outline-none resize-none" placeholder="Write something..." />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Task Manager ============ */
export function TaskManager() {
  const windows = useOS((s) => s.windows);
  const closeWindow = useOS((s) => s.closeWindow);
  const cpu = Math.floor(15 + Math.random() * 30);
  const ram = Math.floor(40 + windows.length * 5);
  return (
    <div className="flex flex-col h-full bg-black/50 p-3">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-center">
          <p className="text-[10px] text-cyan-300/60">CPU</p>
          <p className="text-xl font-bold neon-text-cyan">{cpu}%</p>
          <div className="h-1 bg-black/60 rounded-full mt-1"><div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full" style={{ width: `${cpu}%` }} /></div>
        </div>
        <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-center">
          <p className="text-[10px] text-cyan-300/60">Memory</p>
          <p className="text-xl font-bold neon-text-magenta">{ram}%</p>
          <div className="h-1 bg-black/60 rounded-full mt-1"><div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full" style={{ width: `${ram}%` }} /></div>
        </div>
        <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-center">
          <p className="text-[10px] text-cyan-300/60">Processes</p>
          <p className="text-xl font-bold neon-text-purple">{windows.length}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="text-cyan-300/60 text-[10px] uppercase sticky top-0 bg-black/60">
            <tr><th className="text-left p-2">Name</th><th className="text-right p-2">CPU</th><th className="text-right p-2">Memory</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {windows.map((w) => (
              <tr key={w.id} className="border-t border-cyan-500/10 hover:bg-cyan-500/10">
                <td className="p-2 text-cyan-100">{w.title}</td>
                <td className="p-2 text-right text-cyan-300/70">{Math.floor(Math.random() * 5)}%</td>
                <td className="p-2 text-right text-cyan-300/70">{Math.floor(20 + Math.random() * 80)} MB</td>
                <td className="p-2 text-right"><button onClick={() => closeWindow(w.id)} className="text-fuchsia-300 hover:text-fuchsia-200">✕</button></td>
              </tr>
            ))}
            {windows.length === 0 && <tr><td colSpan={4} className="text-center p-4 text-cyan-300/40">No processes running</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ Camera ============ */
export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("none");
  const [photo, setPhoto] = useState<string | null>(null);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError("Camera access denied or unavailable");
    }
  };
  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);
  const filters: Record<string, string> = {
    none: "none",
    neon: "hue-rotate(180deg) saturate(2)",
    cyber: "contrast(1.5) saturate(1.5) hue-rotate(90deg)",
    thermal: "invert(1) hue-rotate(180deg)",
    bw: "grayscale(1)",
  };
  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.filter = filters[filter]; ctx.drawImage(videoRef.current, 0, 0); setPhoto(canvas.toDataURL()); }
  };
  return (
    <div className="flex flex-col h-full bg-black/60 p-3 gap-3">
      <div className="flex gap-1">
        {Object.keys(filters).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-2 py-1 rounded text-[10px] capitalize", filter === f ? "neon-border-cyan" : "bg-black/40 text-cyan-300/60")}>{f}</button>
        ))}
      </div>
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden neon-border-cyan flex items-center justify-center">
        {error ? (
          <div className="text-center p-6">
            <p className="text-fuchsia-300 text-sm mb-3">{error}</p>
            <button onClick={start} className="neon-btn px-4 py-2 rounded-lg text-xs">Enable camera</button>
          </div>
        ) : stream ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ filter: filters[filter] }} />
            {photo && <img src={photo} alt="capture" className="absolute top-2 right-2 w-24 h-24 rounded-lg border border-cyan-400" />}
          </>
        ) : (
          <button onClick={start} className="neon-btn px-6 py-3 rounded-lg text-sm">📷 Start camera</button>
        )}
      </div>
      {stream && (
        <button onClick={capture} className="neon-btn py-2 rounded-lg">📸 Capture</button>
      )}
    </div>
  );
}

/* ============ Recycle Bin ============ */
export function RecycleBin() {
  const [items, setItems] = useState<{ id: string; name: string; size: number }[]>([
    { id: "1", name: "old_notes.txt", size: 2048 },
    { id: "2", name: "temp_data.tmp", size: 10240 },
    { id: "3", name: "backup.zip", size: 5242880 },
  ]);
  const restore = (id: string) => setItems((i) => i.filter((x) => x.id !== id));
  const empty = () => setItems([]);
  return (
    <div className="flex flex-col h-full bg-black/50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold neon-text-cyan">🗑️ Recycle Bin</h2>
        <button onClick={empty} className="text-xs text-fuchsia-300 hover:text-fuchsia-200">Empty Bin</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">📄</span>
              <div>
                <p className="text-xs text-cyan-100">{item.name}</p>
                <p className="text-[10px] text-cyan-300/50">{item.size < 1024 ? `${item.size} B` : item.size < 1048576 ? `${(item.size / 1024).toFixed(1)} KB` : `${(item.size / 1048576).toFixed(1)} MB`}</p>
              </div>
            </div>
            <button onClick={() => restore(item.id)} className="text-[10px] text-emerald-300 hover:text-emerald-200">Restore</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-cyan-300/40 text-xs mt-8">Recycle Bin is empty.</p>}
      </div>
    </div>
  );
}
