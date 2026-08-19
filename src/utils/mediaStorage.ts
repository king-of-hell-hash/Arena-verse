/**
 * Client-side Persistent Media Storage using IndexedDB
 * Handles storing large images and videos offline directly in the browser's IndexedDB,
 * ensuring files persist without localStorage 5MB size limit restrictions.
 */

const DB_NAME = 'versus_arena_media_db_v1';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export interface StoredMediaRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 or blob url
  timestamp: number;
}

/**
 * Saves a File (Image or Video) to IndexedDB and returns a Data URL / Record
 */
export async function saveMediaFile(file: File): Promise<StoredMediaRecord> {
  const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Convert to DataURL for immediate & offline durability
  const dataUrl = await fileToDataUrl(file);

  const record: StoredMediaRecord = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl,
    timestamp: Date.now(),
  };

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save to IndexedDB, fallback to in-memory/DataURL:', err);
  }

  return record;
}

/**
 * Loads a media record by ID from IndexedDB
 */
export async function getMediaFile(id: string): Promise<StoredMediaRecord | null> {
  try {
    const db = await getDB();
    return await new Promise<StoredMediaRecord | null>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

/**
 * Helper to convert a File to base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable size (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
