const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0]; // Ignore query string
    
    // Rewrite rules
    if (reqUrl === '/design' || reqUrl === '/design/') {
        reqUrl = '/design.html';
    } else if (reqUrl.startsWith('/design/')) {
        reqUrl = reqUrl.replace('/design/', '/');
    }

    // Default to index.html if root requested? 
    // Usually strict mapping is better for debugging to avoid confusion
    if (reqUrl === '/') {
        // Maybe redirect to /design? Or serve design.html?
        // User asked for /design page mapping
    }

    const filePath = path.normalize(path.join(ROOT, reqUrl));

    // Security check: ensure we stay within ROOT
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end(`File not found: ${reqUrl} (mapped to ${filePath})`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mimeType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/design`);
    console.log(`Mapping /design/* to ./*`);
});
