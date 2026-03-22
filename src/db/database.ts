import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LocalDemoDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      name: string;
      password: string;
      avatar?: string;
      createdAt: string;
      isAdmin?: boolean;
    };
    indexes: { 'by-email': string };
  };
  sessions: {
    key: string;
    value: {
      token: string;
      userId: string;
      createdAt: string;
      expiresAt: string;
    };
  };
  files: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      mimeType: string;
      size: number;
      storageBackend: 'opfs' | 'indexeddb';
      opfsPath?: string;
      blob?: Blob;
      createdAt: string;
    };
    indexes: { 'by-userId': string };
  };
}

class DatabaseService {
  private db: IDBPDatabase<LocalDemoDB> | null = null;

  async init() {
    this.db = await openDB<LocalDemoDB>('localdemo-db', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'token' });
        }

        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('by-userId', 'userId', { unique: false });
        }
      },
    });

    await this.initializeSuperAdmin();
  }

  private async initializeSuperAdmin() {
    const adminEmail = 'admin@nowhere.com';
    const existingAdmin = await this.getUserByEmail(adminEmail);

    if (!existingAdmin) {
      await this.createUser({
        id: 'admin-super-user',
        email: adminEmail,
        password: 'admin123',
        name: '超级管理员',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      });
      console.log('超级管理员账户已创建: admin@nowhere.com / admin123');
    }
  }

  async getUser(id: string) {
    if (!this.db) await this.init();
    return this.db!.get('users', id);
  }

  async getUserByEmail(email: string) {
    if (!this.db) await this.init();
    return this.db!.getFromIndex('users', 'by-email', email);
  }

  async createUser(user: LocalDemoDB['users']['value']) {
    if (!this.db) await this.init();
    await this.db!.add('users', user);
    return user;
  }

  async createSession(session: LocalDemoDB['sessions']['value']) {
    if (!this.db) await this.init();
    await this.db!.add('sessions', session);
    return session;
  }

  async getSession(token: string) {
    if (!this.db) await this.init();
    return this.db!.get('sessions', token);
  }

  async deleteSession(token: string) {
    if (!this.db) await this.init();
    await this.db!.delete('sessions', token);
  }

  async updateUser(id: string, updates: Partial<LocalDemoDB['users']['value']>) {
    if (!this.db) await this.init();
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...updates };
    await this.db!.put('users', updated);
    return updated;
  }

  async createFile(file: LocalDemoDB['files']['value']) {
    if (!this.db) await this.init();
    await this.db!.add('files', file);
    return file;
  }

  async getFile(id: string) {
    if (!this.db) await this.init();
    return this.db!.get('files', id);
  }

  async getFilesByUserId(userId: string) {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('files', 'by-userId', userId);
  }

  async deleteFile(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('files', id);
  }
}

export const db = new DatabaseService();
