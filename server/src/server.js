import path from 'node:path';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

// Point to server/.env if run from root
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });
// Also try standard .env in case it's run from server/ dir
dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Server failed to start:', error);
  process.exit(1);
});
