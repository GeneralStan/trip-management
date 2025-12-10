/**
 * IndexedDB wrapper for storing large data that exceeds sessionStorage limits
 * Use this for trip data and other large datasets
 */

const DB_NAME = 'TripManagementDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

interface IDBStorage {
  set(key: string, value: any): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

class IndexedDBStorage implements IDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });

    return this.dbPromise;
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instance
let storageInstance: IDBStorage | null = null;

export function getStorage(): IDBStorage {
  if (typeof window === 'undefined') {
    // Return a no-op implementation for SSR
    return {
      async set() {},
      async get() { return null; },
      async remove() {},
      async clear() {},
    };
  }

  if (!storageInstance) {
    storageInstance = new IndexedDBStorage();
  }

  return storageInstance;
}

// Convenience functions for common operations
export async function setStorageItem(key: string, value: any): Promise<void> {
  return getStorage().set(key, value);
}

export async function getStorageItem<T>(key: string): Promise<T | null> {
  return getStorage().get<T>(key);
}

export async function removeStorageItem(key: string): Promise<void> {
  return getStorage().remove(key);
}

export async function clearStorage(): Promise<void> {
  return getStorage().clear();
}

// Storage keys constants
export const STORAGE_KEYS = {
  GENERATED_TRIPS: 'generatedTrips',
  SELECTED_STRING_IDS: 'selectedStringIds',
  TRIP_DELIVERY_TYPE: 'tripDeliveryType',
  APPROVAL_TOAST: 'showApprovalToast',
} as const;

