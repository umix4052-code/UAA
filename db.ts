
import { ProjectData } from './types';

class DbHelper {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'AI-AutomationerDB';
    private readonly DB_VERSION = 2;
    private readonly STORE_NAME = 'projects';
    private readonly SAMPLE_STORE = 'voice_samples';

    constructor() { this.init(); }

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => reject('IndexedDB initialization error');
            request.onsuccess = () => { this.db = request.result; resolve(); };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'projectName' });
                }
                if (!db.objectStoreNames.contains(this.SAMPLE_STORE)) {
                    db.createObjectStore(this.SAMPLE_STORE, { keyPath: 'id' });
                }
            };
        });
    }
    
    private async getDb(): Promise<IDBDatabase> {
        if (!this.db) { await this.init(); }
        return this.db!;
    }

    public async saveProject(projectData: ProjectData): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(projectData);
            request.onerror = () => reject('Error saving project');
            request.onsuccess = () => resolve();
        });
    }

    public async loadProject(projectName: string): Promise<ProjectData | undefined> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(projectName);
            request.onerror = () => reject('Error loading project');
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    public async deleteProject(projectName: string): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(projectName);
            request.onerror = () => reject('Error deleting project');
            request.onsuccess = () => resolve();
        });
    }
    
    public async getAllProjectNames(): Promise<string[]> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAllKeys();
            request.onerror = () => reject('Error fetching project names');
            request.onsuccess = () => resolve(request.result as string[]);
        });
    }

    public async clearAllProjects(): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();
            request.onerror = () => reject('Error clearing projects');
            request.onsuccess = () => resolve();
        });
    }

    // --- Voice Sample Methods ---
    public async saveVoiceSample(id: string, audioData: ArrayBuffer): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve) => {
            const transaction = db.transaction(this.SAMPLE_STORE, 'readwrite');
            const store = transaction.objectStore(this.SAMPLE_STORE);
            const request = store.put({ id, audioData, timestamp: Date.now() });
            request.onerror = () => { console.warn("Failed to cache voice sample"); resolve(); }; // Soft fail
            request.onsuccess = () => resolve();
        });
    }

    public async getVoiceSample(id: string): Promise<ArrayBuffer | null> {
        const db = await this.getDb();
        return new Promise((resolve) => {
            const transaction = db.transaction(this.SAMPLE_STORE, 'readonly');
            const store = transaction.objectStore(this.SAMPLE_STORE);
            const request = store.get(id);
            request.onerror = () => resolve(null);
            request.onsuccess = () => {
                if (request.result && request.result.audioData) {
                    resolve(request.result.audioData);
                } else {
                    resolve(null);
                }
            };
        });
    }

    public async clearVoiceSamples(): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.SAMPLE_STORE, 'readwrite');
            const store = transaction.objectStore(this.SAMPLE_STORE);
            const request = store.clear();
            request.onerror = () => reject('Error clearing voice samples');
            request.onsuccess = () => resolve();
        });
    }
}

export const dbHelper = new DbHelper();
