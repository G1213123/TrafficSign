const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');
const DESIGN_PREFIX = '/design';

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

    // Keep local routing aligned with deployment where the app is mounted at /design.
    if (reqUrl === '/') {
        res.writeHead(302, { Location: DESIGN_PREFIX });
        res.end();
        return;
    }

    if (reqUrl === DESIGN_PREFIX || reqUrl === DESIGN_PREFIX + '/') {
        reqUrl = '/design.html';
    } else if (reqUrl.startsWith(DESIGN_PREFIX + '/')) {
        // /design/images/foo.svg -> /images/foo.svg
        // /design/js/main.js -> /js/main.js
        reqUrl = '/' + reqUrl.slice((DESIGN_PREFIX + '/').length);
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
    console.log(`Server running at http://localhost:${PORT}${DESIGN_PREFIX}`);
    console.log(`Alias enabled: ${DESIGN_PREFIX}/* -> /*`);
    console.log(`Example image URL: http://localhost:${PORT}${DESIGN_PREFIX}/images/stack.svg`);
});
