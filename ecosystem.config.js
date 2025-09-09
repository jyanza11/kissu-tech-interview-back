module.exports = {
  apps: [
    {
      name: 'kissu-backend',
      script: 'dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart configuration
      autorestart: true,
      watch: false, // Disable in production
      max_memory_restart: '1G',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Environment variables
      env_file: '.env',
      
      // Advanced PM2 features
      merge_logs: true,
      time: true,
      
      // Source map support
      source_map_support: true,
      
      // Node.js specific options
      node_args: '--max-old-space-size=1024',
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:jyanza11/kissu-tech-interview-back.git',
      path: '/var/www/kissu-tech-interview-back',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
