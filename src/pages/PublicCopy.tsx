import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCopyByToken, addTimelineEvent } from '../services/api';
import type { Book, BookCopy, CopyTimelineEvent } from '../types';
import { CopyEventType } from '../types';
import { CopyTimeline } from '../components/CopyTimeline';


export const PublicCopy = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ book: Book; copy: BookCopy; timeline: CopyTimelineEvent[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [isRescuing, setIsRescuing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (token) {
        const res = await fetchCopyByToken(token);
        setData(res || null);
      }
      setIsLoading(false);
    };
    load();
  }, [token]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !note.trim()) return;
    
    await addTimelineEvent({
      libraryId: data.copy.libraryId,
      bookCopyId: data.copy.id,
      userId: data.copy.libraryId, // Placeholder: Use Guest ID in production
      eventType: CopyEventType.ANNOTATED,
      isAnonymous: true,
      note: note.trim(),
      locationTag: location.trim()
    });
    
    // Refresh
    const res = await fetchCopyByToken(token!);
    setData(res || null);
    setNote('');
    setLocation('');
    setShowNoteForm(false);
  };

  const handleRescue = async () => {
    if (!data) return;
    setIsRescuing(true);
    await addTimelineEvent({
      libraryId: data.copy.libraryId,
      bookCopyId: data.copy.id,
      userId: data.copy.libraryId, // Placeholder
      eventType: CopyEventType.RESCUED,
      isAnonymous: true,
      note: "Copy was found and reported via public scan!",
      locationTag: "Lost & Found Scan"
    });
    const res = await fetchCopyByToken(token!);
    setData(res || null);
    setIsRescuing(false);
  };

  if (isLoading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Loading the story...</div>;
  if (!data) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Story not found. This copy might be missing from our records.</div>;

  const { book, copy, timeline } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Book Header */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
          <img src={book.coverUrl} alt={book.title} style={{ width: '120px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
          <div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{book.title}</h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '16px' }}>{book.author}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ padding: '4px 12px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {copy.totalReaders} Readers
              </span>
              <span style={{ padding: '4px 12px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {copy.rescueCount} Rescues
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button 
            onClick={() => setShowNoteForm(!showNoteForm)}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
              background: '#8b5cf6', color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <span className="material-symbols-outlined">edit_note</span>
            Add Your Note
          </button>
          <button 
            onClick={handleRescue}
            disabled={isRescuing}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', 
              background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <span className="material-symbols-outlined">stars</span>
            Mark as Rescued
          </button>
        </div>

        {/* Note Form */}
        {showNoteForm && (
          <form onSubmit={handleAddNote} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <textarea 
              placeholder="What did you feel while reading this copy?"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', padding: '12px', marginBottom: '16px', outline: 'none' }}
            />
            <input 
              type="text" 
              placeholder="Your current location (e.g. Mumbai)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', padding: '12px', marginBottom: '16px', outline: 'none' }}
            />
            <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Publish to Timeline
            </button>
          </form>
        )}

        {/* Timeline */}
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Life Story of this Copy</h2>
        <CopyTimeline events={timeline} />
        
        {/* Journey Stats */}
        {copy.longestJourney && (
          <div style={{ marginTop: '60px', padding: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(14,165,233,0.1))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <h3 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Longest Journey</h3>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{copy.longestJourney}</div>
          </div>
        )}
      </div>
    </div>
  );
};
