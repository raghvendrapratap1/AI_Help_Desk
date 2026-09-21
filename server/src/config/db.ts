import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dns from 'dns';

// Fix Node.js SRV DNS lookup issues on Windows / local ISP DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[DB] Could not set custom DNS servers:', e);
}

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host || 'connected';
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`[DB] Connected to MongoDB via URI: ${uri}`);
      return uri;
    } catch (err: any) {
      console.warn(`[DB] Connection to MONGODB_URI failed (${err.message}). Falling back to MongoMemoryServer...`);
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  }

  // Fallback to MongoMemoryServer if URI fails or is missing
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create();
    }
    const mongoUri = mongoMemoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`[DB] Connected to embedded MongoMemoryServer at: ${mongoUri}`);
    return mongoUri;
  } catch (error: any) {
    console.error('[DB] Failed to start MongoMemoryServer:', error);
    process.exit(1);
  }
};
