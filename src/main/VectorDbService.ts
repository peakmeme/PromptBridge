import path from 'path';
import fs from 'fs';

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
    // 如果在 Electron 环境中，使用 getPath
    try {
      const { app } = require('electron');
      const userDataPath = app.getPath('userData');
      this.dbPath = path.join(userDataPath, 'peakmeme.lancedb');
    } catch (e) {
      // 如果脱离 Electron 运行 (如 tsx 脚本)，使用系统默认路径
      const os = require('os');
      this.dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'peakmeme', 'peakmeme.lancedb');
    }
    
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
      console.log(`[VectorDbService] 创建新表: ${this.tableName}`);
      return null;
    }
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

  /**
   * 向量搜索
   * @param vector 512 维 Float32Array 向量
   * @param limit 返回最相似的 Top-K 条目
   */
  async search(vector: number[], limit: number = 3): Promise<DocRecord[]> {
    const table = await this.getTable();
    if (!table) return [];

    console.log(`[VectorDbService] 正在执行向量检索 (Top-${limit})...`);
    const results = await table
      .vectorSearch(vector)
      .limit(limit)
      .toArray();

    return results as DocRecord[];
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
