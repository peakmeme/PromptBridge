import * as lancedb from '@lancedb/lancedb';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * 独立的 LanceDB 测试脚本
 * 模拟在用户数据目录下初始化数据库并进行增删改查
 */
async function runTest() {
  // 模拟 Electron 的 app.getPath('userData')
  // 在 macOS 下通常是 ~/Library/Application Support/peakmeme
  const fakeUserDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'peakmeme-test');
  const dbPath = path.join(fakeUserDataPath, 'peakmeme.lancedb');

  console.log(`\n--- [LanceDB 测试开始] ---`);
  console.log(`数据库物理路径: ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  try {
    // 1. 连接数据库
    console.log('正在连接数据库...');
    const db = await lancedb.connect(dbPath);

    const tableName = 'test_documents';
    const tableNames = await db.tableNames();

    // 2. 准备假数据 (带 512 维随机向量)
    const mockVector = Array.from({ length: 512 }, () => Math.random());
    const mockData = [
      {
        id: '1',
        text: '这是 LanceDB 入库测试文本 1',
        vector: mockVector,
        source_file: 'test.pdf'
      },
      {
        id: '2',
        text: '这是 LanceDB 入库测试文本 2',
        vector: mockVector.map(v => v * 0.9), // 稍微变一点
        source_file: 'test.pdf'
      }
    ];

    // 3. 建表或插入数据
    let table;
    if (!tableNames.includes(tableName)) {
      console.log(`创建新表: ${tableName}`);
      table = await db.createTable(tableName, mockData);
    } else {
      console.log(`打开现有表: ${tableName}`);
      table = await db.openTable(tableName);
      await table.add(mockData);
    }

    // 4. 查询总行数
    const count = await table.countRows();
    console.log(`\n✅ 数据库操作成功！`);
    console.log(`当前表 [${tableName}] 中的条目数: ${count}`);
    
    // 5. 简单搜索测试 (不带向量搜索，仅检查表状态)
    console.log(`\n--- [验证完成] ---`);
    console.log(`请手动前往以下路径查看文件夹是否生成:`);
    console.log(`Finder -> Cmd+Shift+G -> ${dbPath}`);

  } catch (error) {
    console.error('❌ LanceDB 测试失败:', error);
  }
}

runTest();
