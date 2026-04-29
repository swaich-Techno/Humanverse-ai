import { MongoClient } from "mongodb";

type SaveGenerationResult = {
  saved: boolean;
  reason?: string;
};

type GenerationRecord = {
  prompt: string;
  mode: "image" | "video";
  subject: "character" | "place" | "scene" | "product";
  style: "cinematic" | "editorial" | "travel" | "luxury";
  aspectRatio: "1:1" | "3:4" | "16:9" | "9:16";
  duration?: number;
  motionHint?: string;
  addSoundtrack?: boolean;
  enhancedPrompt: string;
  provider: string;
  createdAt: Date;
};

declare global {
  var _humanverseMongoPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return null;
  }

  if (!global._humanverseMongoPromise) {
    const client = new MongoClient(uri);
    global._humanverseMongoPromise = client.connect();
  }

  return global._humanverseMongoPromise;
}

export async function saveGeneration(
  generation: GenerationRecord
): Promise<SaveGenerationResult> {
  const clientPromise = getClientPromise();

  if (!clientPromise) {
    return {
      saved: false,
      reason: "Missing MONGODB_URI"
    };
  }

  try {
    const client = await clientPromise;
    const databaseName = process.env.MONGODB_DB || "humanverse";

    await client.db(databaseName).collection("generations").insertOne(generation);

    return {
      saved: true
    };
  } catch (error) {
    return {
      saved: false,
      reason:
        error instanceof Error ? error.message : "MongoDB save failed unexpectedly"
    };
  }
}
