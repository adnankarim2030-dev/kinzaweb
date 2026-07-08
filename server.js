const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname; // Serves from the root folder d:\kinzaweb

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Handle POST request to save the compiled video
    if (req.method === 'POST' && req.url === '/save-video') {
        const targetPath = path.join(PUBLIC_DIR, 'kinzaanimate', 'animation.webm');
        const fileStream = fs.createWriteStream(targetPath);
        
        req.pipe(fileStream);
        
        req.on('end', () => {
            console.log(`Video saved successfully to ${targetPath}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Video saved successfully!' }));
        });
        
        req.on('error', (err) => {
            console.error('Error saving video:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
    }

    // Handle GET static files serving
    if (req.method === 'GET') {
        const decodedUrl = decodeURIComponent(req.url);
        let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : decodedUrl);
        
        // Prevent directory traversal attacks
        if (!filePath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        const extname = path.extname(filePath);
        let contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    // Try with .html extension for clean URLs support (like Vercel)
                    const htmlPath = filePath + '.html';
                    if (fs.existsSync(htmlPath)) {
                        fs.readFile(htmlPath, (htmlErr, htmlContent) => {
                            if (htmlErr) {
                                res.writeHead(500);
                                res.end(`Server Error: ${htmlErr.code}`);
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(htmlContent, 'utf-8');
                            }
                        });
                        return;
                    }
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
