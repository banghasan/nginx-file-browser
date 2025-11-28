const http = require('http');
const path = require('path');
const handler = require('serve-handler');

const publicDir = path.resolve(__dirname, '..');
const port = process.env.PORT || 4173;

const listings = {
  '/': [
    {
      name: 'documents',
      type: 'directory',
      mtime: '2023-01-03T00:00:00.000Z',
    },
    {
      name: 'readme.txt',
      type: 'file',
      size: 1024,
      mtime: '2023-01-02T00:00:00.000Z',
    },
  ],
  '/documents/': [
    {
      name: 'notes.txt',
      type: 'file',
      size: 2048,
      mtime: '2023-01-04T00:00:00.000Z',
    },
  ],
};

function normalizeFilesPath(urlPath = '/') {
  const [pathname] = urlPath.split('?');
  let relativePath = decodeURIComponent(pathname.replace(/^\/files/, ''));

  if (!relativePath || relativePath === '/') {
    return '/';
  }

  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  if (!relativePath.endsWith('/')) {
    relativePath = `${relativePath}/`;
  }

  return relativePath;
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/files')) {
    const normalizedPath = normalizeFilesPath(request.url);
    const payload = listings[normalizedPath];

    if (!payload) {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(payload));
    return;
  }

  return handler(request, response, {
    public: publicDir,
  });
});

server.listen(port, () => {
  console.log(`Test server running at http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
