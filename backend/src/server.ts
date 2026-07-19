import dotenv from 'dotenv';
import path from 'path';

// Register global error handlers to prevent uncaught socket stream exceptions from crashing the server
process.on('uncaughtException', (err) => {
  console.warn('[Uncaught Exception Handled]:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Unhandled Rejection Handled]:', reason);
});

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import prisma from './lib/prisma';
import { startSyncScheduler, stopSyncScheduler } from './services/mikrotik/sync-scheduler';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Test Database connection
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connection established successfully.');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`[Server] DeRoyal Hotspot OS API is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });

    // Start background synchronization scheduler
    await startSyncScheduler();

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      stopSyncScheduler();
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server shut down complete.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Fatal error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
