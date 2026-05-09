import React from 'react';

export const QRStickerGenerator: React.FC<{ qrCode: string, title: string, copyId: string }> = ({ qrCode, title }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .sticker { width: 200px; height: 200px; border: 2px solid #000; padding: 16px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
            .title { font-size: 12px; font-weight: bold; margin-bottom: 8px; max-height: 30px; overflow: hidden; }
            .qr { width: 120px; height: 120px; margin: 0 auto; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px; }
            .code { font-size: 14px; margin-top: 8px; font-family: monospace; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="title">${title}</div>
            <!-- In real app, use qrcode.react here to render base64 SVG/Canvas -->
            <div class="qr">[QR CODE: ${qrCode}]</div>
            <div class="code">${qrCode}</div>
          </div>
          <script>window.print(); setTimeout(window.close, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div style={{ width: '200px', height: '200px', background: '#fff', color: '#000', padding: '16px', display: 'flex', flexDirection: 'column', textAlign: 'center', borderRadius: '8px', marginBottom: '16px' }}>
         <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', maxHeight: '30px', overflow: 'hidden' }}>{title}</div>
         <div style={{ flex: 1, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>QR Placeholder</div>
         <div style={{ fontSize: '14px', marginTop: '8px', fontFamily: 'monospace', fontWeight: 'bold' }}>{qrCode}</div>
      </div>
      <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Print Sticker
      </button>
    </div>
  );
};
