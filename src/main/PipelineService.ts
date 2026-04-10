import { DocParser } from './DocParser';
import { TextChunker } from './TextChunker';
import { embeddingService } from './EmbeddingService';
import { vectorDbService, DocRecord } from './VectorDbService';
import path from 'path';

export class PipelineService {
  /**
   * 处理单个文件的全流程流水线
   * 路径 -> 解析 -> 切片 -> 向量化 -> 数据库
   */
  public static async processFile(filePath: string): Promise<boolean> {
    const fileName = path.basename(filePath);
    console.log(`\n🚀 [Pipeline] 开始处理文件: ${fileName}`);

    try {
      // 1. 解析阶段
      console.log(`[Pipeline] 阶段 1/4: 正在解析文件内容...`);
      const fullText = await DocParser.parseFile(filePath);
      console.log(`[Pipeline] 解析成功，文本长度: ${fullText.length}`);

      // 2. 切片阶段
      console.log(`[Pipeline] 阶段 2/4: 正在进行语义切片...`);
      const chunks = TextChunker.chunk(fullText, 400, 50);
      console.log(`[Pipeline] 切片成功，共生成 ${chunks.length} 个片段`);

      // 3. 向量化阶段
      console.log(`[Pipeline] 阶段 3/4: 正在执行本地 Embedding 向量化...`);
      const records: DocRecord[] = [];
      
      // 初始化模型
      await embeddingService.init();

      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i];
        const vector = await embeddingService.getEmbedding(text);
        
        records.push({
          id: `${fileName}_${Date.now()}_${i}`,
          text: text,
          vector: Array.from(vector), // LanceDB 需要普通数组
          source_file: fileName
        });

        if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
          console.log(`[Pipeline] 向量化进度: ${i + 1}/${chunks.length}`);
        }
      }

      // 4. 数据库入库阶段
      console.log(`[Pipeline] 阶段 4/4: 正在存入本地向量数据库...`);
      await vectorDbService.addDocuments(records);
      const totalRows = await vectorDbService.count();
      console.log(`[Pipeline] 入库成功！当前数据库总行数: ${totalRows}`);

      console.log(`✅ [Pipeline] 文件处理完成: ${fileName}\n`);
      return true;

    } catch (error) {
      console.error(`❌ [Pipeline] 处理文件失败: ${fileName}`, error);
      throw error;
    }
  }
}
