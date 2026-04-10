import * as lancedb from '@lancedb/lancedb';
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
  private db: lancedb.Connection | null = null;
  private readonly tableName = 'documents';
  private dbPath: string = '';

  constructor() {
    // 获取 Electron 用户数据目录
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'peakmeme.lancedb');
    
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  async init() {
    if (this.db) return;
    
    console.log(`[VectorDbService] 正在初始化数据库: ${this.dbPath}`);
    this.db = await lancedb.connect(this.dbPath);
  }

  async getTable() {
    await this.init();
    const tableNames = await this.db!.tableNames();
    
    if (tableNames.includes(this.tableName)) {
      return await this.db!.openTable(this.tableName);
    } else {
      // 第一次建表，LanceDB 会根据第一条数据自动推断 Schema
      // 也可以显式定义，这里我们先通过空数据或示例数据初始化
      console.log(`[VectorDbService] 创建新表: ${this.tableName}`);
      return null;
    }
  }

  async addDocuments(records: DocRecord[]) {
    await this.init();
    const tableNames = await this.db!.tableNames();
    
    if (!tableNames.includes(this.tableName)) {
      await this.db!.createTable(this.tableName, records);
    } else {
      const table = await this.db!.openTable(this.tableName);
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
