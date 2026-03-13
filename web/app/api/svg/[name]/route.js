import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { name } = params;

  // Construct path to the SVG file
  // Assuming the Next.js app is in /web/ and SVGs are in /data/svgs/
  const svgDir = path.join(process.cwd(), '..', 'data', 'svgs');
  const filePath = path.join(svgDir, name);

  // Security check: ensure the file is within the allowed directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(svgDir))) {
    return new Response('Access denied', { status: 403 });
  }

  try {
    if (!fs.existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath);

    return new Response(fileContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving SVG:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
