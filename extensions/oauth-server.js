import { createServer } from 'node:http';
import { parse } from 'node:url';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 8085;
let latestCode = null;
let latestState = null;

const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173'];


const SUCCESS_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Calmeca</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Maven+Pro:wght@200;300;400&display=swap');
 
  * { margin: 0; padding: 0; box-sizing: border-box; }
 
  html, body {
    height: 100%;
    background: #000;
    background: rgba(0, 0, 0, 0.7);
  }
 
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Maven Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
 
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    opacity: 0;
    transform: scale(0.95);
    animation: enter 0.6s cubic-bezier(0.6, -0.05, 0.01, 0.99) forwards;
  }
 
  .check {
    width: 40px;
    height: 40px;
    margin-bottom: 0.5rem;
  }
 
  .check circle {
    stroke: rgba(255, 255, 255, 0.25);
    stroke-width: 1.5;
    fill: none;
  }
 
  .check path {
    stroke: #fff;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: draw 0.4s ease-out 0.4s forwards;
  }
 
  h1 {
    font-size: 1.75rem;
    font-weight: 200;
    color: #fff;
    letter-spacing: 0.01em;
  }
 
  p {
    font-size: 0.8rem;
    font-weight: 300;
    color: #a3a3a3;
    letter-spacing: 0.01em;
  }
 
  @keyframes enter {
    to { opacity: 1; transform: scale(1); }
  }
 
  @keyframes draw {
    to { stroke-dashoffset: 0; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <svg class="check" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" />
      <path d="M12 20.5l5.5 5.5L28 14" />
    </svg>
    <h1>you're signed in</h1>
    <p>close this tab and return to the app.</p>
  </div>
  <script>
    setTimeout(() => window.close(), 1200);
  </script>
</body>
</html>`;

function getCorsHeaders(req) {
  const origin = req.headers.origin;
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : 'http://127.0.0.1:5173';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function sendJson(req, res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...getCorsHeaders(req),
  });
  res.end(JSON.stringify(payload));
}

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, getCorsHeaders(req));
    res.end();
    return;
  }

  if (parsedUrl.pathname === '/callback') {
    const code = parsedUrl.query.code;
    const state = parsedUrl.query.state;
    if (code) {
      latestCode = code;
      latestState = state || null;

      const codeFilePath = join(process.cwd(), 'auth_code.tmp');
      writeFileSync(codeFilePath, code);

      res.writeHead(200, {
        'Content-Type': 'text/html',
        ...getCorsHeaders(req),
      });
      res.end(SUCCESS_HTML);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Authorization code missing.');
    }
  } else if (parsedUrl.pathname === '/callback-status') {
    if (latestCode) {
      const payload = { code: latestCode, state: latestState };
      latestCode = null; 
      latestState = null;
      sendJson(req, res, 200, payload);
    } else {
      sendJson(req, res, 200, { code: null, state: null });
    }
  } else if (parsedUrl.pathname === '/reset') {
    latestCode = null;
    latestState = null;
    sendJson(req, res, 200, { ok: true });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.warn(`[oauth-server] Port ${PORT} is already in use. The callback server is already running.`);
    return;
  }

  console.error('[oauth-server] Server error:', error);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[oauth-server] Listening on http://127.0.0.1:${PORT}`);
});