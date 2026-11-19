const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const IMOBILIARIA_DIR = __dirname;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let rawUrl = decodeURI(req.url.split('?')[0]);

  if (rawUrl === '/' || rawUrl === '' || rawUrl === '/index.html') {
    rawUrl = '/index.html';
  }

  // Tentar encontrar o arquivo:
  // 1. Diretamente dentro de Imobiliaria (onde as pastas 1 e 2 foram copiadas!)
  // 2. Ou na pasta pai Downloads
  let candidatePath = path.normalize(path.join(IMOBILIARIA_DIR, rawUrl));

  if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
    const parentAttempt = path.normalize(path.join(ROOT_DIR, rawUrl));
    if (fs.existsSync(parentAttempt) && fs.statSync(parentAttempt).isFile()) {
      candidatePath = parentAttempt;
    }
  }

  fs.stat(candidatePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 - Não encontrado: ${rawUrl}`);
      return;
    }

    const ext = path.extname(candidatePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(candidatePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`[ATELIER IMÓVEIS] Servidor Ativo: http://localhost:${PORT}`);
  console.log('====================================================');
});
