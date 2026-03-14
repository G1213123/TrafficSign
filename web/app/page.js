import Link from 'next/link';
import SignGallery from './components/SignGallery';

export default function Home() {
  return (
    <main className="container">
      <header className="header" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1>Hong Kong Traffic Signs Catalogue</h1>
        <Link href="/map" style={{ 
          display: 'inline-block',
          marginTop: '10px',
          padding: '8px 16px',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          View Map 🗺️
        </Link>
      </header>
      
      <SignGallery />
    </main>
  );
}
