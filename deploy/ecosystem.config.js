module.exports = {
  apps: [
    {
      name: 'deroyal-hotspot-backend',
      script: './dist/server.js',
      cwd: '/var/www/deroyalhotspot/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      
      // Log files
      error_file: '/var/www/deroyalhotspot/logs/backend.err.log',
      out_file: '/var/www/deroyalhotspot/logs/backend.out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Host configuration will connect over the WireGuard tunnel
        MIKROTIK_HOST: '10.0.0.1', 
        MIKROTIK_PORT: 8728,
        MIKROTIK_USERNAME: 'admin',
        MIKROTIK_TIMEOUT: 5000,
        MIKROTIK_SIMULATION_MODE: 'false'
      }
    }
  ]
};
