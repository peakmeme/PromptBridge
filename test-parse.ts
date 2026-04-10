import path from 'path';
import { DocParser } from './src/main/DocParser';

async function main() {
  const testFilePath = path.join(process.cwd(), 'test.pdf');
  
  console.log(`--- [测试开始] 正在读取: ${testFilePath} ---`);
  
  try {
    const text = await DocParser.parseFile(testFilePath);
    
    console.log('\n--- [解析结果 (前1000字符)] ---');
    console.log(text.slice(0, 1000));
    console.log('\n--- [测试结束] ---');
    
  } catch (error) {
    console.error('测试运行失败:', error);
  }
}

main();
