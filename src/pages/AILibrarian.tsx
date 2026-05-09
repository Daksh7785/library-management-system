import React, { useState, useRef, useEffect } from 'react';
import { AILibrarianService } from '../services/librarian';
import type { ChatMessage } from '../services/librarian';
import { motion, AnimatePresence } from 'framer-motion';

export const AILibrarian: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AcademicOS AI Librarian. I have access to over 200 million books and research papers. How can I help you with your research today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await AILibrarianService.chat(input, messages);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', padding: '0 20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>smart_toy</span>
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Academic AI Librarian</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Expert Knowledge Assistant · Connected to Global Catalog</p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '16px 20px',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.role === 'user' ? '#8b5cf6' : '#1e293b',
              color: '#fff',
              fontSize: '15px',
              lineHeight: 1.6,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '16px 20px', borderRadius: '20px 20px 20px 4px', background: '#1e293b' }}>
            <span style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1s infinite 0.2s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1s infinite 0.4s' }} />
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ padding: '8px', background: '#1e293b', borderRadius: '24px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about a book, topic, or recommendation..."
          style={{ flex: 1, background: 'transparent', border: 'none', padding: '16px 20px', color: '#fff', fontSize: '16px', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: '48px', height: '48px', borderRadius: '18px', background: '#8b5cf6',
            border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px', color: '#475569', fontSize: '12px' }}>
        AI Librarian can make mistakes. Verify critical academic citations.
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
};
