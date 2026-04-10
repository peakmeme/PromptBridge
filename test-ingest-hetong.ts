import { PipelineService } from './src/main/PipelineService';
import path from 'path';

async function runIngest() {
  const filePath = path.join(process.cwd(), 'hetong.txt');
  console.log(`\n--- [开始靶标数据入库] ---`);
  console.log(`文件路径: ${filePath}`);

  try {
    // 直接复用 PipelineService.processFile 走完 解析 -> 切片 -> 向量化 -> 入库
    const success = await PipelineService.processFile(filePath);
    
    if (success) {
      console.log(`\n✅ 靶标数据 [hetong.txt] 入库成功！`);
      console.log(`现在你可以运行 npx tsx test-search.ts 来验证精准度了。`);
    } else {
      console.log(`\n❌ 入库失败，请检查控制台报错。`);
    }
  } catch (error) {
    console.error('❌ 运行入库脚本时出错:', error);
  }
}

runIngest();
