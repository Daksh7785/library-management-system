declare module 'react-qr-scanner' {
  import React from 'react';
  interface QrScannerProps {
    onScan?: (data: any) => void;
    onError?: (err: any) => void;
    style?: React.CSSProperties;
    delay?: number | boolean;
    facingMode?: 'user' | 'environment';
    constraints?: any;
    className?: string;
  }
  const QrScanner: React.ComponentType<QrScannerProps>;
  export default QrScanner;
}

declare module 'react-qr-reader' {
  import React from 'react';
  interface QrReaderProps {
    onScan: (data: string | null) => void;
    onError: (err: any) => void;
    delay?: number | boolean;
    facingMode?: 'user' | 'environment';
    legacyMode?: boolean;
    resolution?: number;
    showViewFinder?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }
  const QrReader: React.ComponentType<QrReaderProps>;
  export default QrReader;
}

declare module 'qrcode';
