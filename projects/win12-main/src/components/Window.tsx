import { useRef, useState, useEffect } from 'react';

interface WindowProps {
  id?: string;
  title: string;
  icon: string;
  isActive: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  defaultPos?: { x: number; y: number };
  defaultSize?: { w: number; h: number };
  children: React.ReactNode;
  accentColor?: string;
}

export default function Window({
  title, icon, isActive, isMinimized, onClose, onMinimize, onMaximize, onFocus,
  defaultPos = { x: 100, y: 60 },
  defaultSize = { w: 900, h: 580 },
  children,
  accentColor = '#00f5ff',
}: WindowProps) {
  const [pos, setPos] = useState(defaultPos);
  const [size] = useState(defaultSize);
  const [maximized, setMaximized] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, wx: 0, wy: 0 });

  const handleMaximize = () => {
    setMaximized(m => !m);
    onMaximize();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (maximized) return;
    onFocus();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, wx: pos.x, wy: pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPos({
        x: Math.max(0, dragStart.current.wx + dx),
        y: Math.max(0, dragStart.current.wy + dy),
      });
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (isMinimized) return null;

  const style: React.CSSProperties = maximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 52px)', zIndex: isActive ? 500 : 400 }
    : { position: 'fixed', top: pos.y, left: pos.x, width: size.w, height: size.h, zIndex: isActive ? 500 : 400 };

  return (
    <div
      className="window-panel window-enter rounded-xl overflow-hidden flex flex-col"
      style={{
        ...style,
        boxShadow: isActive
          ? `0 30px 100px rgba(0,0,0,0.9), 0 0 30px ${accentColor}22`
          : '0 20px 60px rgba(0,0,0,0.7)',
        border: `1px solid ${isActive ? accentColor + '55' : 'rgba(0,245,255,0.15)'}`,
        transition: maximized ? 'all 0.3s cubic-bezier(0.4,0,0.2,1)' : 'border 0.15s, box-shadow 0.15s',
      }}
      onClick={onFocus}
    >
      {/* Title bar */}
      <div
        className="window-titlebar flex items-center justify-between px-4 py-2 shrink-0"
        style={{ cursor: maximized ? 'default' : 'move', height: '42px' }}
        onMouseDown={onMouseDown}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span className="share-tech text-sm" style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            {title}
          </span>
          {isActive && (
            <span className="share-tech" style={{ fontSize: '10px', color: `${accentColor}88`, marginLeft: '8px' }}>
              — ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
          {/* Minimize */}
          <button
            className="flex items-center justify-center rounded-md transition-all hover:bg-yellow-400/20"
            style={{ width: '28px', height: '24px', border: '1px solid rgba(255,200,0,0.3)', color: '#ffc000', fontSize: '12px' }}
            onClick={onMinimize}
          >─</button>
          {/* Maximize */}
          <button
            className="flex items-center justify-center rounded-md transition-all hover:bg-cyan-400/20"
            style={{ width: '28px', height: '24px', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff', fontSize: '11px' }}
            onClick={handleMaximize}
          >{maximized ? '🗗' : '□'}</button>
          {/* Close */}
          <button
            className="flex items-center justify-center rounded-md transition-all hover:bg-red-500/30"
            style={{ width: '28px', height: '24px', border: '1px solid rgba(255,50,50,0.4)', color: '#ff5555', fontSize: '13px' }}
            onClick={onClose}
          >✕</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
