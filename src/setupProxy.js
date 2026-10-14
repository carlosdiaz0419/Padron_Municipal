const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/health'],
    createProxyMiddleware({
      target: process.env.REACT_APP_BACKEND_URL || 'https://backend-beneficiarios-production.up.railway.app',
      changeOrigin: true,
      secure: false,
    })
  );
};
