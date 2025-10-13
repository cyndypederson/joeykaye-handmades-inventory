module.exports = {
  apps: [{
    name: 'joeykaye-inventory',
    script: 'server.js',
    cwd: '/Users/cyndyp/Desktop/Projects/JoeyKayeHandmades',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
