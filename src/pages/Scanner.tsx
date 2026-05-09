import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Scanner: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copyInfo, setCopyInfo] = useState<any>(null);
  const reader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const startScanner = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (videoInputDevices.length > 0 && videoRef.current) {
          // Use the rear camera if available
          const deviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
          reader.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
            if (result && result.getText()) {
              handleScan(result.getText());
            }
          });
        }
      } catch (err) {
        console.error("Scanner Error:", err);
        addToast("Camera access denied or unavailable", "error");
      }
    };
    startScanner();

    return () => {
      reader.current.reset();
    };
  }, []);

  const handleScan = async (text: string) => {
    // Prevent continuous scanning of the same code
    if (text === scannedData) return;
    setScannedData(text);
    reader.current.reset(); // Stop scanning once we got a code

    // Fetch copy info
    const { data: copy } = await supabase.from('book_copies').select('*, books(title, author)').eq('qr_code', text).single();
    if (copy) {
      const { data: tx } = await supabase.from('transactions').select('*, profiles(full_name)').eq('copy_id', copy.id).is('returned_at', null).single();
      setCopyInfo({ ...copy, currentBorrower: tx?.profiles?.full_name || null, txId: tx?.id || null });
    } else {
      addToast("Invalid QR Code", "error");
      setScannedData(null);
      startScanner(); // restart
    }
  };

  const startScanner = async () => {
    if (videoRef.current) {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (videoInputDevices.length > 0) {
          const deviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
          reader.current.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
            if (result && result.getText()) handleScan(result.getText());
          });
        }
    }
  }

  const handleReturn = async () => {
    if (!copyInfo?.txId) return;
    try {
      await supabase.from('transactions').update({ returned_at: new Date().toISOString() }).eq('id', copyInfo.txId);
      await supabase.from('book_copies').update({ status: 'available' }).eq('id', copyInfo.id);
      addToast("Book returned successfully", "success");
      setCopyInfo(null);
      setScannedData(null);
      startScanner();
    } catch (e: any) {
      addToast(e.message, "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Living ISBN Scanner</h1>

      <div style={{ width: '100%', maxWidth: '400px', height: '400px', borderRadius: '24px', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.2)', position: 'relative', marginBottom: '32px', background: '#000' }}>
        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '16px' }} />
      </div>

      {copyInfo && (
        <Card style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>{copyInfo.books?.title}</h2>
          <p style={{ margin: '0 0 16px', color: '#a1a1aa' }}>Copy: {copyInfo.qr_code}</p>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '14px' }}>Condition: <strong>{copyInfo.condition_score}%</strong></p>
            <p style={{ margin: '0 0 4px', fontSize: '14px' }}>Status: <strong style={{ color: copyInfo.status === 'available' ? '#10b981' : '#f59e0b' }}>{copyInfo.status}</strong></p>
            {copyInfo.currentBorrower && (
              <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>Borrowed by: {copyInfo.currentBorrower}</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate(`/books/${copyInfo.book_id}`)} style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              View Journey Timeline
            </button>
            {user?.role === 'admin' && copyInfo.currentBorrower && (
              <button onClick={handleReturn} style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Force Return
              </button>
            )}
            <button onClick={() => { setCopyInfo(null); setScannedData(null); startScanner(); }} style={{ padding: '12px', background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
              Scan Another
            </button>
          </div>
        </Card>
      )}
    </motion.div>
  );
};
