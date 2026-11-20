/**
 * IndexedDB Persistent Storage for DRILLPROOF Floor Plans & Architectural Assets.
 * Solves browser localStorage 5MB quota limitations by storing binary/dataURL blobs
 * reliably across reloads and across browser tabs.
 */

const DB_NAME = 'drillproof_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'floor_plans';

export interface StoredFloorPlanRecord {
  id: string; // Key format: `${buildingId}_${floorId}` or `${floorId}`
  buildingId: string;
  floorId: string;
  fileName: string;
  fileType: string;
  dataUrl: string;
  updatedAt: number;
}

// In-memory cache for immediate synchronous access once loaded
const memoryCache = new Map<string, string>();

class ImageStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('buildingId', 'buildingId', { unique: false });
            store.createIndex('floorId', 'floorId', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error || new Error('Failed to open media database.'));
        };
      });
    }

    return this.dbPromise;
  }

  /**
   * Save a floor plan image or PDF dataURL into IndexedDB.
   */
  async saveFloorPlan(
    buildingId: string,
    floorId: string,
    dataUrl: string,
    fileName: string = 'floor_plan.png',
    fileType: string = 'image/png'
  ): Promise<string> {
    const key = `${buildingId}_${floorId}`;
    const record: StoredFloorPlanRecord = {
      id: key,
      buildingId,
      floorId,
      fileName,
      fileType,
      dataUrl,
      updatedAt: Date.now(),
    };

    // Store in memory cache first for instant synchronous UI display
    memoryCache.set(key, dataUrl);
    memoryCache.set(floorId, dataUrl);

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB save failed, keeping in memory cache:', e);
    }

    // Return the persistent reference key
    return `idb://${key}?v=${record.updatedAt}`;
  }

  /**
   * Retrieve a floor plan by buildingId and floorId.
   */
  async getFloorPlan(buildingId: string, floorId: string): Promise<string | null> {
    const key = `${buildingId}_${floorId}`;

    if (memoryCache.has(key)) {
      return memoryCache.get(key) || null;
    }
    if (memoryCache.has(floorId)) {
      return memoryCache.get(floorId) || null;
    }

    try {
      const db = await this.getDB();
      return new Promise<string | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const rec = req.result as StoredFloorPlanRecord | undefined;
          if (rec && rec.dataUrl) {
            memoryCache.set(key, rec.dataUrl);
            memoryCache.set(floorId, rec.dataUrl);
            resolve(rec.dataUrl);
          } else {
            // Also try by floorId index
            const index = store.index('floorId');
            const floorReq = index.get(floorId);
            floorReq.onsuccess = () => {
              const floorRec = floorReq.result as StoredFloorPlanRecord | undefined;
              if (floorRec && floorRec.dataUrl) {
                memoryCache.set(key, floorRec.dataUrl);
                memoryCache.set(floorId, floorRec.dataUrl);
                resolve(floorRec.dataUrl);
              } else {
                resolve(null);
              }
            };
            floorReq.onerror = () => resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete a floor plan from storage.
   */
  async deleteFloorPlan(buildingId: string, floorId: string): Promise<void> {
    const key = `${buildingId}_${floorId}`;
    memoryCache.delete(key);
    memoryCache.delete(floorId);

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB delete failed:', e);
    }
  }

  /**
   * Helper to resolve any plan URL (Data URI, IndexedDB URI, or HTTP URL)
   */
  resolvePlanUrl(url: string | undefined, buildingId: string, floorId: string): Promise<string | null> {
    if (!url) return Promise.resolve(null);

    // If it's already an inline SVG, data URL, or static asset path, return directly
    if (
      url.startsWith('data:') ||
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/') ||
      url.startsWith('./')
    ) {
      return Promise.resolve(url);
    }

    // If it's an IndexedDB pointer (idb://...)
    return this.getFloorPlan(buildingId, floorId);
  }

  /**
   * Synchronous check in memory cache
   */
  getCachedSync(buildingId: string, floorId: string): string | null {
    const key = `${buildingId}_${floorId}`;
    return memoryCache.get(key) || memoryCache.get(floorId) || null;
  }
}

export const ImageStorageService = new ImageStorage();
