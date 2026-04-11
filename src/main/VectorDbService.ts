import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export interface DocRecord {
  id: string;
  text: string;
  vector: number[];
  source_file: string;
  metadata?: string;
}

export class VectorDbService {
  private db: any = null;
  private lancedb: any = null;
  private readonly tableName = 'documents';
  private dbPath: string = '';

  constructor() {
    let userDataPath: string;
    try {
      userDataPath = app.getPath('userData');
    } catch {
      const os = require('os');
      userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'peakmeme');
    }
    this.dbPath = path.join(userDataPath, 'peakmeme.lancedb');

    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  async init() {
    if (this.db) return;

    console.log(`[VectorDbService] 正在初始化数据库: ${this.dbPath}`);
    this.lancedb = await import('@lancedb/lancedb');
    this.db = await this.lancedb.connect(this.dbPath);
  }

  async getTable() {
    await this.init();

    const tableNames = await this.db.tableNames();

    if (tableNames.includes(this.tableName)) {
      return await this.db.openTable(this.tableName);
    } else {
      console.log(`[VectorDbService] 表不存在: ${this.tableName}`);
      return null;
    }
  }

  async search(vector: number[], limit: number = 3): Promise<DocRecord[]> {
    const table = await this.getTable();
    if (!table) return [];

    const results = await table
      .vectorSearch(vector)
      .limit(limit)
      .toArray();

    return results as DocRecord[];
  }

  async addDocuments(records: DocRecord[]) {
    await this.init();
    const tableNames = await this.db.tableNames();

    if (!tableNames.includes(this.tableName)) {
      await this.db.createTable(this.tableName, records);
    } else {
      const table = await this.db.openTable(this.tableName);
      await table.add(records);
    }
  }

  async count(): Promise<number> {
    const table = await this.getTable();
    if (!table) return 0;
    return await table.countRows();
  }

  async getFiles(): Promise<string[]> {
    try {
      const table = await this.getTable();
      if (!table) {
        console.log('[VectorDbService] getFiles: 表不存在');
        return [];
      }

      const records = await table.query().toArray();
      console.log(`[VectorDbService] getFiles: 查到记录总条数: ${records.length}`);

      if (records.length === 0) return [];

      const filePaths = Array.from(new Set(
        records.map((r: any) => r.source_file || r.source)
          .filter((p): p is string => typeof p === 'string' && p.length > 0)
      )) as string[];

      console.log('[VectorDbService] getFiles: 提取到唯一文件列表:', filePaths);
      return filePaths.sort();
    } catch (error) {
      console.error('[VectorDbService] getFiles 失败:', error);
      return [];
    }
  }

  async deleteFiles(filePaths: string[]): Promise<boolean> {
    try {
      const table = await this.getTable();
      if (!table || filePaths.length === 0) {
        return false;
      }

      const escapedPaths = filePaths.map((p) => `'${p.replace(/'/g, "''")}'`).join(', ');
      const predicate = `source_file IN (${escapedPaths})`;
      console.log('[VectorDbService] deleteFiles predicate:', predicate);
      await table.delete(predicate);
      return true;
    } catch (error) {
      console.error('[VectorDbService] deleteFiles 失败:', error);
      return false;
    }
  }

  async clearDatabase(): Promise<boolean> {
    try {
      await this.init();
      const tableNames = await this.db.tableNames();

      if (tableNames.includes(this.tableName)) {
        await this.db.dropTable(this.tableName);
        console.log(`[VectorDbService] 已删除表: ${this.tableName}`);
      }

      return true;
    } catch (error) {
      console.error('[VectorDbService] clearDatabase 失败:', error);
      return false;
    }
  }

  getDbPath(): string {
    return this.dbPath;
  }
}

export const vectorDbService = new VectorDbService();
