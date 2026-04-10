import path from 'path';
import { DocParser } from './src/main/DocParser';
import { TextChunker } from './src/main/TextChunker';
import { embeddingService } from './src/main/EmbeddingService';

async function main() {
  const testFilePath = path.join(process.cwd(), 'test.pdf');
  
  console.log(`\n--- [1. 开始解析 PDF] ---`);
  console.log(`文件路径: ${testFilePath}`);
  
  try {
    // 1. 解析文件
    const fullText = await DocParser.parseFile(testFilePath);
    console.log(`解析成功，全文长度: ${fullText.length} 字符`);
    console.log(`全文前 100 字符: "${fullText.slice(0, 100)}..."`);

    // 2. 切片处理
    console.log(`\n--- [2. 开始文本切片] ---`);
    const chunkSize = 400;
    const overlap = 50;
    const chunks = TextChunker.chunk(fullText, chunkSize, overlap);
    console.log(`切片完成，共计: ${chunks.length} 个片段`);

    // 3. 向量化处理 (本地模型)
    console.log(`\n--- [3. 开始向量化 (Embedding)] ---`);
    console.log(`使用本地模型: Xenova/bge-small-zh-v1.5`);
    
    // 初始化服务 (预热模型)
    await embeddingService.init();

    // 为了测试，我们只处理前 3 个切片
    const limit = Math.min(chunks.length, 3);
    for (let i = 0; i < limit; i++) {
      const chunkText = chunks[i];
      console.log(`\n正在处理切片 [${i}] (长度: ${chunkText.length}):`);
      console.log(`切片文本预览: "${chunkText.slice(0, 50)}..."`);
      
      const vector = await embeddingService.getEmbedding(chunkText);
      console.log(`生成向量成功: 维度=${vector.length}, 前 5 位=[${Array.from(vector.slice(0, 5)).map(n => n.toFixed(4)).join(', ')}]`);
    }

    if (chunks.length > limit) {
      console.log(`\n... 还有 ${chunks.length - limit} 个切片已省略 ...`);
    }

    console.log('\n--- [全流程测试结束] ---');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  }
}

main();
