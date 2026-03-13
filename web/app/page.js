import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SignGallery from './components/SignGallery';

// Use a server component to fetch data
async function getSigns() {
  // Path to the svgs directory relative to the web app root
  // The web app is at /web/
  // The svgs are at /data/svgs/
  const svgsDir = path.join(process.cwd(), '..', 'data', 'svgs');
  
  if (!fs.existsSync(svgsDir)) {
    console.error(`SVG directory not found: ${svgsDir}`);
    return [];
  }

  const files = fs.readdirSync(svgsDir);
  const svgFiles = files.filter(file => file.endsWith('.svg'));
  
  // Parse sign numbers
  const signs = svgFiles.map(file => {
    // Extract number from TS_XXXX.svg
    const match = file.match(/^TS_(\d+)/);
    const signNumber = match ? match[1] : file.replace('.svg', '');
    
    return {
      filename: file,
      signNumber: signNumber,
      // For images, we will use an API route to serve them
      imageUrl: `/api/svg/${file}`
    };
  }).sort((a, b) => {
    // Try to sort numerically if possible
    const numA = parseInt(a.signNumber);
    const numB = parseInt(b.signNumber);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.signNumber.localeCompare(b.signNumber);
  });

  return signs;
}

export default async function Home() {
  const signs = await getSigns();

  return (
    <main className="container">
      <header className="header">
        <h1>Hong Kong Traffic Signs Catalogue</h1>
        <p>Total Signs: {signs.length}</p>
      </header>
      
      <SignGallery signs={signs} />
    </main>
  );
}
