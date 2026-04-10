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
    // 获取 Electron 用户数据目录
    let userDataPath: string;
    try {
      userDataPath = app.getPath('userData');
    } catch (e) {
      // 兼容非 Electron 环境（如测试脚本）
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
    // 动态导入 ESM 模块
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

  getDbPath(): string {
    return this.dbPath;
  }
}

export const vectorDbService = new VectorDbService();
