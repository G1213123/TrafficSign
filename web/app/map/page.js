'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Map...</div>,
});

export default function MapPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Map />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50px', // Avoid overlap with zoom controls
        zIndex: 1000,
        background: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#0070f3' }}>
          ← Back to Catalogue
        </Link>
      </div>
    </div>
  );
}
