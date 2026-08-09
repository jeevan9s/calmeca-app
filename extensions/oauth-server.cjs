const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
let latestCode = null;
let latestState = null;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/callback') {
    const code = parsedUrl.query.code;
    const state = parsedUrl.query.state;
    if (code) {
      latestCode = code;
      latestState = state || null;

      const codeFilePath = path.join(process.cwd(), 'auth_code.tmp');
      fs.writeFileSync(codeFilePath, code);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!DOCTYPE html><html><body><h3>Authentication successful! You can close this window.</h3><script>window.close();</script></body></html>');
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Authorization code missing.');
    }
  } else if (parsedUrl.pathname === '/callback-status') {
    if (latestCode) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: latestCode, state: latestState }));
    } else {
      res.writeHead(204);
      res.end();
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1');