import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Greetings. I am ARIA. I have initialized my PhD-level research protocols. How shall we accelerate your mastery today?' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input.toLowerCase();
    setInput('');
    
    setTimeout(() => {
      let reply = "Processing your query through my knowledge architect agent... I recommend analyzing the cross-domain links between this topic and decentralization.";
      if (currentInput.includes('find') || currentInput.includes('search')) {
        reply = "I am triaging the global catalog. Are you looking for foundational academic papers or practical innovation hooks?";
      } else if (currentInput.includes('due') || currentInput.includes('overdue')) {
        reply = "I have scanned your transaction ledger. You have one active borrow at 85% risk of overdue. I recommend an immediate return or renewal.";
      } else if (currentInput.includes('career') || currentInput.includes('job')) {
        reply = "I can initiate a Career DNA Analysis. Please paste your resume in the Career DNA module for a FAANG-level triage.";
      } else if (currentInput.includes('who are you') || currentInput.includes('identity')) {
        reply = "I am ARIA (Agentic Research Intelligence Assistant). I operate as a 6-agent autonomous research orchestrator. I think in systems, not just answers.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }} 
            style={{ width: '350px', height: '450px', background: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>smart_toy</span> AI Librarian
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', fontSize: '14px', borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px', borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px' }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '10px 16px', color: '#fff', outline: 'none' }} />
              <button onClick={handleSend} style={{ background: '#3b82f6', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)', position: 'absolute', right: 0, bottom: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>chat_bubble</span>
      </button>
    </div>
  );
};
