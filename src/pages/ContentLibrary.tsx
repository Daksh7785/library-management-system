import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMediaContent, searchMediaContent } from '../services/api';
import type { MediaContent, ContentType } from '../types';

const TYPE_META: Record<ContentType, { icon: string; color: string; label: string; emoji: string }> = {
  ebook:     { icon: 'menu_book',     color: '#8b5cf6', label: 'eBook',     emoji: '📖' },
  audiobook: { icon: 'headphones',    color: '#f59e0b', label: 'Audiobook', emoji: '🎧' },
  video:     { icon: 'play_circle',   color: '#ef4444', label: 'Video',     emoji: '🎬' },
  paper:     { icon: 'article',       color: '#38bdf8', label: 'Paper',     emoji: '📄' },
  novel:     { icon: 'auto_stories',  color: '#10b981', label: 'Novel',     emoji: '📚' },
  lecture:   { icon: 'school',        color: '#f97316', label: 'Lecture',   emoji: '🎓' },
};

const DEMO_CONTENT: MediaContent[] = [
  { id: 'c1', libraryId: 'l1', uploadedBy: 'u1', title: 'Deep Learning Fundamentals', author: 'Ian Goodfellow', description: 'The definitive textbook on deep learning, covering neural networks, backpropagation, and modern architectures.', contentType: 'ebook', coverUrl: '', pageCount: 800, tags: ['AI', 'ML', 'Neural Networks', 'Advanced'], category: 'Computer Science', language: 'en', isPublic: true, isFree: true, viewCount: 2840, downloadCount: 1240, rating: 4.9, ratingsCount: 892, createdAt: new Date().toISOString() },
  { id: 'c2', libraryId: 'l1', uploadedBy: 'u2', title: 'The Power of Habits', author: 'Charles Duhigg', description: 'Why we do what we do in life and business — a scientific exploration of habit loops.', contentType: 'audiobook', coverUrl: '', durationSec: 11 * 3600, tags: ['Self-Help', 'Psychology', 'Beginner'], category: 'Psychology', language: 'en', isPublic: true, isFree: true, viewCount: 1920, downloadCount: 980, rating: 4.7, ratingsCount: 634, createdAt: new Date().toISOString() },
  { id: 'c3', libraryId: 'l1', uploadedBy: 'u3', title: 'Attention Is All You Need', author: 'Vaswani et al.', description: 'The original transformer architecture paper that revolutionized NLP and AI.', contentType: 'paper', coverUrl: '', pageCount: 11, tags: ['NLP', 'Transformers', 'Research', 'Advanced'], category: 'AI Research', language: 'en', isPublic: true, isFree: true, viewCount: 5120, downloadCount: 3200, rating: 5.0, ratingsCount: 1204, createdAt: new Date().toISOString() },
  { id: 'c4', libraryId: 'l1', uploadedBy: 'u4', title: 'Introduction to Quantum Computing', author: 'MIT OpenCourseWare', description: 'Full video lecture series on quantum mechanics and quantum computing fundamentals.', contentType: 'video', coverUrl: '', durationSec: 48 * 3600, tags: ['Quantum', 'Physics', 'Computer Science', 'Intermediate'], category: 'Physics', language: 'en', isPublic: true, isFree: true, viewCount: 3410, downloadCount: 890, rating: 4.8, ratingsCount: 567, createdAt: new Date().toISOString() },
  { id: 'c5', libraryId: 'l1', uploadedBy: 'u5', title: 'Dune', author: 'Frank Herbert', description: 'The groundbreaking science fiction epic about politics, religion, and ecology on a desert planet.', contentType: 'novel', coverUrl: '', pageCount: 688, tags: ['Sci-Fi', 'Epic', 'Classic', 'Beginner'], category: 'Fiction', language: 'en', isPublic: true, isFree: false, viewCount: 4200, downloadCount: 2100, rating: 4.9, ratingsCount: 2341, createdAt: new Date().toISOString() },
  { id: 'c6', libraryId: 'l1', uploadedBy: 'u6', title: 'System Design Interview', author: 'Alex Xu', description: 'An insider guide covering common system design interview questions and best answers.', contentType: 'ebook', coverUrl: '', pageCount: 352, tags: ['Engineering', 'Interviews', 'Intermediate'], category: 'Computer Science', language: 'en', isPublic: true, isFree: false, viewCount: 1870, downloadCount: 940, rating: 4.6, ratingsCount: 423, createdAt: new Date().toISOString() },
  { id: 'c7', libraryId: 'l1', uploadedBy: 'u7', title: 'Clean Code Masterclass', author: 'Robert C. Martin', description: 'Video lecture series on writing clean, maintainable software — principles every engineer should know.', contentType: 'lecture', coverUrl: '', durationSec: 8 * 3600, tags: ['Programming', 'Best Practices', 'Intermediate'], category: 'Software Engineering', language: 'en', isPublic: true, isFree: true, viewCount: 2230, downloadCount: 1120, rating: 4.8, ratingsCount: 789, createdAt: new Date().toISOString() },
  { id: 'c8', libraryId: 'l1', uploadedBy: 'u8', title: 'The Art of War', author: 'Sun Tzu', description: 'Ancient Chinese military treatise on strategy, tactics, and leadership that remains relevant today.', contentType: 'audiobook', coverUrl: '', durationSec: 2 * 3600, tags: ['Philosophy', 'Strategy', 'Classic', 'Beginner'], category: 'Philosophy', language: 'en', isPublic: true, isFree: true, viewCount: 3100, downloadCount: 1600, rating: 4.7, ratingsCount: 1102, createdAt: new Date().toISOString() },
];

const COVER_GRADIENTS: Record<ContentType, string> = {
  ebook: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  audiobook: 'linear-gradient(135deg,#f59e0b,#d97706)',
  video: 'linear-gradient(135deg,#ef4444,#dc2626)',
  paper: 'linear-gradient(135deg,#38bdf8,#0284c7)',
  novel: 'linear-gradient(135deg,#10b981,#059669)',
  lecture: 'linear-gradient(135deg,#f97316,#ea580c)',
};

const formatDuration = (sec?: number) => {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} className="material-symbols-outlined" style={{ fontSize: '13px', color: i <= Math.round(rating) ? '#f59e0b' : '#334155', fontVariationSettings: "'FILL' 1" }}>star</span>
    ))}
    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '3px' }}>{rating.toFixed(1)}</span>
  </div>
);

export const ContentLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<MediaContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MediaContent[] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchMediaContent(user?.libraryId, typeFilter === 'all' ? undefined : typeFilter);
      setContent(data.length ? data : DEMO_CONTENT);
      setIsLoading(false);
    };
    load();
  }, [user, typeFilter]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults(null); return; }
    setIsSearching(true);
    const results = await searchMediaContent(q, user?.libraryId);
    setSearchResults(results.length ? results : DEMO_CONTENT.filter(c =>
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      (c.author || '').toLowerCase().includes(q.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
    ));
    setIsSearching(false);
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => handleSearch(search), 400);
    return () => clearTimeout(t);
  }, [search, handleSearch]);

  const displayed = searchResults ?? (typeFilter === 'all' ? content : content.filter(c => c.contentType === typeFilter));
  const counts = Object.fromEntries(
    (Object.keys(TYPE_META) as ContentType[]).map(t => [t, content.filter(c => c.contentType === t).length])
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#8b5cf6' }}>video_library</span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1.5px', margin: 0 }}>Content Library</h1>
        </div>
        <p style={{ color: '#64748b', margin: 0 }}>eBooks, Audiobooks, Videos, Research Papers, Lectures & Novels — all in one place.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {(Object.entries(TYPE_META) as [ContentType, typeof TYPE_META[ContentType]][]).map(([type, meta]) => (
          <button key={type} onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)} style={{
            padding: '14px 10px', borderRadius: '14px', border: `1px solid ${typeFilter === type ? meta.color + '40' : 'rgba(255,255,255,0.06)'}`,
            background: typeFilter === type ? `${meta.color}12` : 'rgba(255,255,255,0.02)',
            cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{meta.emoji}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: typeFilter === type ? meta.color : '#f8fafc' }}>{counts[type] || 0}</div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meta.label}</div>
          </button>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>search</span>
          {isSearching && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }}>sync</span>}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, papers, authors, topics..."
            style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === v ? '#8b5cf6' : 'transparent', color: viewMode === v ? '#fff' : '#64748b', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{v === 'grid' ? 'grid_view' : 'view_list'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid / List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }}>sync</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {displayed.map(item => {
            const meta = TYPE_META[item.contentType];
            return (
              <div key={item.id} onClick={() => navigate(`/content/${item.id}`)} style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                overflow: 'hidden', transition: 'all 0.25s', animation: 'fadeIn 0.3s ease'
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-6px)'; el.style.borderColor = meta.color + '30'; el.style.boxShadow = `0 20px 40px ${meta.color}10`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.boxShadow = 'none'; }}
              >
                {/* Cover */}
                <div style={{ height: '160px', background: COVER_GRADIENTS[item.contentType], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.3)', fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                  <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: meta.color }}>{meta.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{meta.label}</span>
                  </div>
                  {!item.isFree && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.9)', fontSize: '10px', fontWeight: 700, color: '#fff' }}>PREMIUM</div>
                  )}
                  {(item.durationSec || item.pageCount) && (
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,0,0,0.5)', fontSize: '11px', color: '#fff', fontWeight: 600 }}>
                      {item.durationSec ? formatDuration(item.durationSec) : `${item.pageCount}p`}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>{item.author}</p>
                  <StarRating rating={item.rating} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', background: `${meta.color}12`, color: meta.color, fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                    <span style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>{item.viewCount.toLocaleString()}
                    </span>
                    <button style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: `${meta.color}15`, color: meta.color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{['audiobook','video','lecture'].includes(item.contentType) ? 'play_arrow' : 'open_in_new'}</span>
                      {['audiobook','video','lecture'].includes(item.contentType) ? 'Play' : 'Read'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayed.map(item => {
            const meta = TYPE_META[item.contentType];
            return (
              <div key={item.id} onClick={() => navigate(`/content/${item.id}`)} style={{
                padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = meta.color + '30'; el.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.transform = 'translateX(0)'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: COVER_GRADIENTS[item.contentType], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)', fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{item.title}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: `${meta.color}15`, color: meta.color, flexShrink: 0 }}>{meta.label}</span>
                    {!item.isFree && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', flexShrink: 0 }}>PREMIUM</span>}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{item.author} · {item.category}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <StarRating rating={item.rating} />
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    {item.durationSec ? formatDuration(item.durationSec) : `${item.pageCount || 0} pages`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayed.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>search_off</span>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No content found{search ? ` for "${search}"` : ''}.</p>
        </div>
      )}
    </div>
  );
};
