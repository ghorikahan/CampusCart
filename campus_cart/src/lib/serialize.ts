import { Types } from "mongoose";

type PlainObject = Record<string, unknown>;

/**
 * Deeply converts MongoDB lean documents containing ObjectIds and Dates
 * into plain JSON-serializable structures safe for Client Components.
 */
export function serializeData<T>(data: unknown): T {
  if (data === null || data === undefined) {
    return data as T;
  }

  // Handle Mongoose / BSON ObjectId
  if (data instanceof Types.ObjectId || (typeof data === "object" && "_bsontype" in data && (data as { _bsontype: string })._bsontype === "ObjectID")) {
    return data.toString() as unknown as T;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  // Handle Plain Objects
  if (typeof data === "object") {
    // If it's a Buffer or other special object, convert or ignore
    if (Buffer.isBuffer(data)) {
      return data.toString("base64") as unknown as T;
    }

    const serialized: PlainObject = {};
    for (const [key, value] of Object.entries(data as PlainObject)) {
      if (key === "_id" && value) {
        serialized.id = value.toString();
        serialized._id = value.toString();
      } else {
        serialized[key] = serializeData(value);
      }
    }
    return serialized as T;
  }

  return data as T;
}

/**
 * Serializes a single Mongoose lean document into a client-safe plain object.
 */
export function serializeDocument<T>(doc: unknown): T | null {
  if (!doc) return null;
  return serializeData<T>(doc);
}

/**
 * Serializes an array of Mongoose lean documents into client-safe plain objects.
 */
export function serializeDocuments<T>(docs: unknown[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => serializeData<T>(doc));
}

/**
 * Validates whether a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

