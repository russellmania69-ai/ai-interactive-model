const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] ? parseInt(process.argv[2], 10) : 5178;
const base = '/ai-interactive-model';
const distDir = path.join(__dirname, '..', 'dist');

const mime = (ext) => {
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.map': return 'application/octet-stream';
    default: return 'application/octet-stream';
  }
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURI(req.url);
    if (!url.startsWith(base)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    let rel = url.slice(base.length) || '/';
    if (!rel.startsWith('/')) rel = '/' + rel;
    let filePath = path.join(distDir, rel);

    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');

    if (!fs.existsSync(filePath)) {
      const fallback = path.join(distDir, 'index.html');
      if (fs.existsSync(fallback)) {
        const data = fs.readFileSync(fallback);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mime(ext);
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

// Ensure seed-data is present in the dist before serving
try {
  const { execSync } = require('child_process');
  const prep = path.join(__dirname, 'prepare-serve.cjs');
  if (fs.existsSync(prep)) {
    console.log('[serve-dist-base] running prepare-serve to populate seed-data.json');
    try {
      execSync(`node "${prep}" "${distDir}"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[serve-dist-base] prepare-serve failed or returned non-zero:', e && e.message);
    }
  }
} catch (e) {
  console.warn('[serve-dist-base] failed to run prepare-serve:', e && e.message);
}

server.listen(port, () => {
  console.log(`Serving dist at http://localhost:${port}${base}/`);
});
