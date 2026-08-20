import { MongoClient, type Collection } from 'mongodb';

/**
 * Global high score for the background game.
 *
 * Storage is optional on purpose: with no MONGODB_URI the helpers report
 * "unavailable" and the client falls back to the per-browser best, so local
 * development and any preview without the variable still work.
 */

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? 'portfolio';
const COLLECTION = 'scores';
const DOC_ID = 'starwars-global';

interface ScoreDoc {
  _id: string;
  best: number;
  updatedAt: Date;
}

/**
 * One client for the lifetime of the process, cached on globalThis.
 *
 * This is the standard MongoDB-on-serverless trap: a fresh MongoClient per
 * invocation opens a new connection pool every cold start, and an Atlas
 * free cluster runs out of connections long before it runs out of traffic.
 * The global also survives dev hot-reloads, which would otherwise leak a
 * pool on every file save.
 */
const globalForMongo = globalThis as unknown as {
  _scoreClient?: Promise<MongoClient>;
};

function connect(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (!globalForMongo._scoreClient) {
    globalForMongo._scoreClient = new MongoClient(uri, {
      // A counter needs almost nothing, and every socket counts against the
      // free tier's connection ceiling.
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }
  return globalForMongo._scoreClient;
}

async function collection(): Promise<Collection<ScoreDoc> | null> {
  const client = await connect();
  if (!client) return null;
  return client.db(DB_NAME).collection<ScoreDoc>(COLLECTION);
}

export const scoreStoreReady = Boolean(uri);

/**
 * Highest score anyone has recorded, or null if the store is unreachable.
 * A read failure must never take the page down: the game is decoration.
 */
export async function getGlobalBest(): Promise<number | null> {
  try {
    const col = await collection();
    if (!col) return null;
    const doc = await col.findOne({ _id: DOC_ID });
    return typeof doc?.best === 'number' ? doc.best : 0;
  } catch {
    return null;
  }
}

/**
 * Records a score and returns the resulting global best.
 *
 * $max does the comparison inside the database, so this is one atomic
 * round trip. Reading the current value and writing it back from here
 * would let two players finishing at the same moment both read the old
 * figure, with the lower write landing last and erasing the higher score.
 */
export async function submitScore(score: number): Promise<number | null> {
  try {
    const col = await collection();
    if (!col) return null;

    const result = await col.findOneAndUpdate(
      { _id: DOC_ID },
      { $max: { best: score }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    // Driver versions differ on whether the document comes back directly or
    // wrapped in { value }, so accept either shape.
    const doc =
      (result as unknown as { value?: ScoreDoc } | ScoreDoc | null) ?? null;
    const best =
      doc && 'value' in (doc as object)
        ? (doc as { value?: ScoreDoc }).value?.best
        : (doc as ScoreDoc | null)?.best;

    return typeof best === 'number' ? best : score;
  } catch {
    return null;
  }
}
