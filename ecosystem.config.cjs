module.exports = {
  apps: [
    {
      name: 'movie-business-api',
      script: 'server/index.js',
      cwd: '/var/www/movie-business',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8787,
      },
    },
  ],
};
