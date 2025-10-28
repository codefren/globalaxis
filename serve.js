import handler from 'serve-handler';
import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'dist',
    rewrites: [
      { source: '/**', destination: '/index.html' }
    ]
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
