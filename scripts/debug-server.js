const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.resolve(__dirname, '..');
const DESIGN_PREFIX = '/design';
const TEMPLATE_BASE_PLACEHOLDER = /<%=\s*htmlWebpackPlugin\.options\.customBase\s*%>/g;
const DEBUG_MAIN_SCRIPT = '<script type="module" src="/design/js/main.js"></script>';

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

        // Render template placeholders in design.html so debug server can serve
        // source templates without requiring webpack HTML processing.
        if (path.basename(filePath).toLowerCase() === 'design.html') {
            fs.readFile(filePath, 'utf8', (readErr, html) => {
                if (readErr) {
                    res.writeHead(500);
                    res.end(`Failed to read template: ${readErr.message}`);
                    return;
                }

                let rendered = html.replace(TEMPLATE_BASE_PLACEHOLDER, `${DESIGN_PREFIX}/`);

                // In debug mode we serve source HTML directly, so inject the module entry
                // that HtmlWebpackPlugin would normally inject in production builds.
                if (!rendered.includes('/js/main.js')) {
                    rendered = rendered.replace('</body>', `    ${DEBUG_MAIN_SCRIPT}\n</body>`);
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(rendered);
            });
            return;
        }

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
