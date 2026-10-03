import { useState } from 'react';

interface FileItem { name: string; type: 'folder' | 'file'; size?: string; modified: string; icon: string; }

const fileSystem: Record<string, FileItem[]> = {
  root: [
    { name: 'Desktop', type: 'folder', modified: 'Today', icon: '🖥️' },
    { name: 'Documents', type: 'folder', modified: 'Today', icon: '📁' },
    { name: 'Downloads', type: 'folder', modified: 'Today', icon: '📥' },
    { name: 'Mars_Colony_Plans', type: 'folder', modified: '2h ago', icon: '🏠' },
    { name: 'SpaceX_Missions', type: 'folder', modified: '5h ago', icon: '🚀' },
    { name: 'Tesla_FSD_Data', type: 'folder', modified: 'Yesterday', icon: '🚗' },
    { name: 'xAI_Research', type: 'folder', modified: '3 days ago', icon: '🤖' },
    { name: 'Giga_Texas_Schematics.pdf', type: 'file', size: '842 MB', modified: 'Last week', icon: '📄' },
    { name: 'Neuralink_N2_Spec.docx', type: 'file', size: '12.4 MB', modified: 'Last week', icon: '📝' },
    { name: 'DOGE_Portfolio_2025.xlsx', type: 'file', size: '2.1 MB', modified: 'Yesterday', icon: '📊' },
    { name: 'Starlink_v3_Design.stl', type: 'file', size: '1.8 GB', modified: '2 days ago', icon: '🛰️' },
    { name: 'Mars_Colony_Song.mp3', type: 'file', size: '48 MB', modified: '1 month ago', icon: '🎵' },
    { name: 'Boring_Co_Tunnel.mp4', type: 'file', size: '12 GB', modified: '2 months ago', icon: '🎥' },
  ],
  Documents: [
    { name: 'Master_Plan_Pt3.pdf', type: 'file', size: '4.2 MB', modified: 'Today', icon: '📄' },
    { name: 'xAI_Grok5_Roadmap.docx', type: 'file', size: '8.8 MB', modified: 'Yesterday', icon: '📝' },
    { name: 'AGI_Safety_Notes.txt', type: 'file', size: '128 KB', modified: '2 days ago', icon: '📋' },
  ],
};

const locations = [
  { name: 'Home', icon: '🏠', key: 'root' },
  { name: 'Documents', icon: '📄', key: 'Documents' },
  { name: 'Downloads', icon: '📥', key: 'root' },
  { name: 'Mars Drive', icon: '🔴', key: 'root' },
  { name: 'StarDrive™', icon: '💾', key: 'root' },
  { name: 'X Cloud', icon: '☁️', key: 'root' },
  { name: 'Starlink Backup', icon: '🛰️', key: 'root' },
];

export default function FilesApp() {
  const [currentPath, setCurrentPath] = useState('root');
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeLocation, setActiveLocation] = useState('root');

  const files = fileSystem[currentPath] || fileSystem.root;

  const open = (item: FileItem) => {
    if (item.type === 'folder' && fileSystem[item.name]) {
      setCurrentPath(item.name);
      setActiveLocation(item.name);
    }
  };

  return (
    <div className="h-full flex" style={{ background: '#030810' }}>
      {/* Sidebar */}
      <div
        className="w-44 shrink-0 py-3 flex flex-col"
        style={{ borderRight: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,5,15,0.8)' }}
      >
        <div className="px-3 pb-2 share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.4)', letterSpacing: '2px' }}>QUICK ACCESS</div>
        {locations.map(loc => (
          <button
            key={loc.key + loc.name}
            className="flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-cyan-500/10"
            style={{
              color: activeLocation === loc.key && loc.key === currentPath ? '#00f5ff' : 'rgba(255,255,255,0.6)',
              borderLeft: activeLocation === loc.key ? '2px solid #00f5ff' : '2px solid transparent',
            }}
            onClick={() => { setCurrentPath(loc.key); setActiveLocation(loc.key); }}
          >
            <span>{loc.icon}</span>
            <span className="share-tech text-xs truncate">{loc.name}</span>
          </button>
        ))}

        <div className="mt-3 px-3 pt-2 pb-2 share-tech" style={{ borderTop: '1px solid rgba(0,245,255,0.1)', fontSize: '10px', color: 'rgba(0,245,255,0.4)', letterSpacing: '2px' }}>
          DRIVES
        </div>
        {[
          { name: 'C: StarDrive™', usage: 12, icon: '💽', color: '#00f5ff' },
          { name: 'M: Mars Drive', usage: 45, icon: '🔴', color: '#ff6600' },
          { name: 'X: Cloud', usage: 8, icon: '☁️', color: '#bf00ff' },
        ].map((d, i) => (
          <div key={i} className="px-3 py-2">
            <div className="flex items-center gap-1 mb-1">
              <span style={{ fontSize: '12px' }}>{d.icon}</span>
              <span className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{d.name}</span>
            </div>
            <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${d.usage}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,5,15,0.5)' }}
        >
          <div className="flex items-center gap-2">
            <button
              className="share-tech text-xs px-2 py-1 rounded hover:bg-white/5"
              style={{ color: 'rgba(0,245,255,0.6)' }}
              onClick={() => { setCurrentPath('root'); setActiveLocation('root'); }}
            >
              ← Back
            </button>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg share-tech text-xs"
              style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)', color: '#00f5ff' }}
            >
              🏠 / {currentPath === 'root' ? 'Home' : currentPath}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="share-tech text-xs px-2 py-1 rounded transition-all"
              style={{ background: view === 'grid' ? 'rgba(0,245,255,0.15)' : 'transparent', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}
              onClick={() => setView('grid')}
            >⊞</button>
            <button
              className="share-tech text-xs px-2 py-1 rounded transition-all"
              style={{ background: view === 'list' ? 'rgba(0,245,255,0.15)' : 'transparent', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}
              onClick={() => setView('list')}
            >☰</button>
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 overflow-auto p-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-5 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all hover:bg-cyan-500/10 group"
                  style={{
                    border: selected === f.name ? '1px solid rgba(0,245,255,0.5)' : '1px solid transparent',
                    background: selected === f.name ? 'rgba(0,245,255,0.08)' : 'transparent',
                  }}
                  onClick={() => setSelected(f.name)}
                  onDoubleClick={() => open(f)}
                >
                  <div
                    className="text-3xl group-hover:scale-110 transition-transform"
                    style={{ filter: selected === f.name ? 'drop-shadow(0 0 8px #00f5ff)' : 'none' }}
                  >{f.icon}</div>
                  <div
                    className="share-tech text-xs text-center leading-tight truncate w-full text-center"
                    style={{ color: selected === f.name ? '#00f5ff' : 'rgba(255,255,255,0.7)', fontSize: '11px' }}
                  >{f.name}</div>
                  {f.size && <div className="share-tech" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.4)' }}>{f.size}</div>}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,245,255,0.15)' }}>
                  {['Name', 'Type', 'Size', 'Modified'].map(h => (
                    <th key={h} className="text-left py-2 px-3 share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.5)', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr
                    key={i}
                    className="cursor-pointer hover:bg-cyan-500/05 transition-all"
                    style={{ borderBottom: '1px solid rgba(0,245,255,0.05)', background: selected === f.name ? 'rgba(0,245,255,0.08)' : 'transparent' }}
                    onClick={() => setSelected(f.name)}
                    onDoubleClick={() => open(f)}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span>{f.icon}</span>
                        <span className="share-tech text-xs" style={{ color: selected === f.name ? '#00f5ff' : 'rgba(255,255,255,0.8)' }}>{f.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 share-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.type === 'folder' ? 'Folder' : f.name.split('.').pop()?.toUpperCase()}</td>
                    <td className="py-2 px-3 share-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.size || '—'}</td>
                    <td className="py-2 px-3 share-tech text-xs" style={{ color: 'rgba(0,245,255,0.5)' }}>{f.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-4 py-1.5 flex items-center justify-between share-tech shrink-0"
          style={{ borderTop: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,5,15,0.5)', fontSize: '10px', color: 'rgba(0,245,255,0.4)' }}
        >
          <span>{files.length} items</span>
          {selected && <span style={{ color: '#00f5ff' }}>{selected} selected</span>}
          <span>StarDrive™ — 88TB free of 100TB</span>
        </div>
      </div>
    </div>
  );
}
