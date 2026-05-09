import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceController: React.FC = () => {
  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    // Mock web speech API implementation
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    setIsListening(!isListening);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9000 }}>
      <button 
        onClick={toggleListen}
        style={{ 
          width: '60px', height: '60px', borderRadius: '50%', 
          background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.8)' : '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isListening ? 'mic' : 'mic_none'}
        </span>
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            style={{ position: 'absolute', left: '80px', bottom: '10px', background: 'rgba(0,0,0,0.8)', padding: '12px 24px', borderRadius: '24px', whiteSpace: 'nowrap', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            Listening... "Hey Library"
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '20px' }}>
              <motion.div animate={{ height: ['4px', '16px', '4px'] }} transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }} style={{ width: '4px', background: '#ef4444', borderRadius: '2px' }} />
              <motion.div animate={{ height: ['4px', '20px', '4px'] }} transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.1 }} style={{ width: '4px', background: '#ef4444', borderRadius: '2px' }} />
              <motion.div animate={{ height: ['4px', '12px', '4px'] }} transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut', delay: 0.2 }} style={{ width: '4px', background: '#ef4444', borderRadius: '2px' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
