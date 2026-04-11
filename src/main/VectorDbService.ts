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
    
    // 强制刷新/重连以确保看到最新数据 (LanceDB 的一些版本可能需要)
    // 但通常连接同一个路径即可。为了稳妥，我们每次都 check tableNames
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

  /**
   * 获取数据库中已索引的文件列表
   */
  async getFiles(): Promise<string[]> {
    try {
      const table = await this.getTable();
      if (!table) {
        console.log('[VectorDbService] getFiles: 表不存在');
        return [];
      }

      // 强制使用最通用的查询方式，并增加日志
      const records = await table.query().toArray();
      console.log(`[VectorDbService] getFiles: 查到记录总条数: ${records.length}`);
      
      if (records.length === 0) return [];

      // 提取 source_file 并过滤无效值
      const filePaths = Array.from(new Set(
        records.map((r: any) => r.source_file || r.source)
          .filter((p): p is string => typeof p === 'string' && p.length > 0)
      )) as string[];
      
      console.log(`[VectorDbService] getFiles: 提取到唯一文件列表:`, filePaths);
      return filePaths.sort();
    } catch (error) {
      console.error('[VectorDbService] getFiles 失败:', error);
      return [];
    }
  }

  /**
   * 按文件路径批量删除已索引的文件
   */
  async deleteFiles(filePaths: string[]): Promise<boolean> {
    const table = await this.getTable();
    if (!table) return false;

    try {
      // 构造过滤条件，例如: source_file IN ('path1', 'path2')
      const filter = `source_file IN (${filePaths.map(p => `'${p.replace(/'/g, "''")}'`).join(', ')})`;
      await table.delete(filter);
      console.log(`[VectorDbService] 已删除文件关联的数据: ${filePaths.length} 个文件`);
      return true;
    } catch (error) {
      console.error('[VectorDbService] 删除文件失败:', error);
      throw error;
    }
  }

  getDbPath(): string {
    return this.dbPath;
  }

  /**
   * 物理删除本地数据库目录
   */
  async clearDatabase(): Promise<boolean> {
    try {
      console.log(`[VectorDbService] 正在清空数据库目录: ${this.dbPath}`);
      
      // 先关闭数据库连接（如果 LanceDB 支持显式关闭，这里最好先 close）
      this.db = null;
      
      if (fs.existsSync(this.dbPath)) {
        // 使用物理删除命令
        fs.rmSync(this.dbPath, { recursive: true, force: true });
        console.log('[VectorDbService] 数据库目录已物理删除');
        
        // 重新创建空目录以备下次使用
        fs.mkdirSync(this.dbPath, { recursive: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[VectorDbService] 清空数据库失败:', error);
      throw error;
    }
  }
}

export const vectorDbService = new VectorDbService();
