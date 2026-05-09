import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VoiceController } from './VoiceController';
import { Chatbot } from './Chatbot';
import { CommandPalette } from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard',       path: '/dashboard',     icon: 'dashboard',            show: 'all' },
      { name: 'Academic Hub',    path: '/lms',           icon: 'school',               show: 'all' },
      { name: 'Library Catalog', path: '/books',         icon: 'library_books',        show: 'all' },
      { name: 'My Sanctuary',    path: '/my-books',      icon: 'auto_stories',         show: 'all' },
      { name: 'My Profile',      path: '/profile',       icon: 'person',               show: 'all' },
    ]
  },
  {
    label: 'Next-Gen',
    items: [
      { name: 'Knowledge Passport', path: '/passport',      icon: 'badge',            show: 'all' },
      { name: 'AI Librarian',       path: '/librarian',     icon: 'smart_toy',        show: 'all' },
      { name: 'Smart Study Mode',   path: '/study',         icon: 'menu_book',        show: 'all' },
      { name: 'Peer Matchmaking',   path: '/peers',         icon: 'group',            show: 'all' },
      { name: 'Resource Hub',       path: '/resources',     icon: 'hub',              show: 'all' },
      { name: 'AI Intelligence',    path: '/intelligence',  icon: 'psychology',       show: 'all' },
      { name: 'Live Heatmap',       path: '/heatmap',       icon: 'travel_explore',   show: 'all' },
    ]
  },
  {
    label: 'Explore',
    items: [
      { name: 'Knowledge Graph', path: '/graph',         icon: 'account_tree',         show: 'all' },
      { name: 'Social Feed',     path: '/feed',          icon: 'public',               show: 'all' },
      { name: 'Marketplace',     path: '/marketplace',   icon: 'storefront',           show: 'all' },
      { name: 'Scan Resource',   path: '/scanner',       icon: 'qr_code_scanner',      show: 'all' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { name: 'Staff Control',  path: '/admin',          icon: 'admin_panel_settings', show: 'staff' },
      { name: 'Catalog Manager', path: '/catalog',        icon: 'database',             show: 'staff' },
      { name: 'Universal Add',   path: '/add-book',       icon: 'add_circle',           show: 'staff' },
      { name: 'Manage Copies',  path: '/admin/copies',   icon: 'inventory_2',          show: 'staff' },
      { name: 'Global Network', path: '/global',         icon: 'globe',                show: 'admin' },
    ]
  },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const canShow = (show: string) => {
    if (show === 'all') return true;
    if (show === 'staff') return isStaff;
    if (show === 'admin') return isAdmin;
    return false;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Inter', sans-serif" }}>
      <VoiceController />
      <CommandPalette />

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: collapsed ? '68px' : '256px',
        background: '#0d1424',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '20px 10px' : '20px 12px',
        zIndex: 50, overflowY: 'auto', overflowX: 'hidden',
        transition: 'width 0.25s ease',
        scrollbarWidth: 'none'
      }}>
        {/* Logo + Collapse */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '28px', padding: collapsed ? 0 : '0 4px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>library_books</span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>AcademicOS</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#8b5cf6', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Global Hub</div>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        {/* Nav Groups */}
        <nav style={{ flex: 1 }}>
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(i => canShow(i.show));
            if (!visibleItems.length) return null;
            return (
              <div key={group.label} style={{ marginBottom: '20px' }}>
                {!collapsed && (
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 12px', marginBottom: '6px' }}>
                    {group.label}
                  </div>
                )}
                {visibleItems.map(item => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link key={item.path} to={item.path} title={collapsed ? item.name : undefined} style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : '10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px' : '10px 12px',
                      borderRadius: '10px', textDecoration: 'none',
                      background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                      color: isActive ? '#a78bfa' : '#64748b',
                      fontWeight: isActive ? 600 : 500, fontSize: '13px',
                      marginBottom: '2px', transition: 'all 0.15s',
                      whiteSpace: 'nowrap', overflow: 'hidden'
                    }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748b'; } }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
                      {!collapsed && isActive && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{
          padding: collapsed ? '8px' : '14px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {collapsed ? (
            <button onClick={handleLogout} title="Sign Out" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', color: '#64748b', padding: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#8b5cf620,#6d28d920)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>{user?.role || 'student'}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '9px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', background: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                Sign Out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: collapsed ? '68px' : '256px', display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40, height: '60px',
          padding: '0 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ position: 'relative', width: '380px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '18px' }}>search</span>
            <input type="text" placeholder="Search books, resources, peers..."
              style={{ width: '100%', padding: '9px 16px 9px 40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: '#f8fafc', fontSize: '13px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/intelligence" style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748b' }}>notifications</span>
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0a0f1e' }} />
            </Link>
            <Link to="/passport" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#a78bfa' }}>badge</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>Passport</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px 32px' }}>
          {children}
        </main>
      </div>

      {/* Floating AI Features */}
      <Chatbot />
    </div>
  );
};
