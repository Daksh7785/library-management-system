import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }} onClick={() => setOpen(false)}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <Command>
          <Command.Input placeholder="Type a command or search..." style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', outline: 'none' }} autoFocus />
          <Command.List style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            <Command.Empty style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa' }}>No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" style={{ color: '#a1a1aa', fontSize: '12px', padding: '8px 8px 4px' }}>
              <Command.Item onSelect={() => { navigate('/'); setOpen(false); }} style={{ padding: '12px', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}>Go to Dashboard</Command.Item>
              <Command.Item onSelect={() => { navigate('/books'); setOpen(false); }} style={{ padding: '12px', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}>Browse Catalog</Command.Item>
              <Command.Item onSelect={() => { navigate('/my-books'); setOpen(false); }} style={{ padding: '12px', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}>My Library</Command.Item>
              <Command.Item onSelect={() => { navigate('/passport'); setOpen(false); }} style={{ padding: '12px', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}>Knowledge Passport</Command.Item>
            </Command.Group>
            
            <Command.Group heading="Actions" style={{ color: '#a1a1aa', fontSize: '12px', padding: '8px 8px 4px' }}>
              <Command.Item onSelect={() => { navigate('/scanner'); setOpen(false); }} style={{ padding: '12px', color: '#fff', cursor: 'pointer', borderRadius: '6px', display: 'flex', gap: '8px' }}><span className="material-symbols-outlined">qr_code_scanner</span> Open Scanner</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        [cmdk-item][aria-selected="true"] { background: rgba(255,255,255,0.1); }
      `}} />
    </div>
  );
};
