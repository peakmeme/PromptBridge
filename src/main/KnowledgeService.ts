import { embeddingService } from './EmbeddingService';
import { vectorDbService } from './VectorDbService';

export class KnowledgeService {
  /**
   * 搜索知识库并生成增强提示词
   * @param query 用户问题
   * @returns 组装好的长文本
   */
  public static async searchKnowledge(query: string): Promise<string> {
    try {
      // 1. 获取 query 的向量 (保持纯断网 local_files_only: true 在 EmbeddingService 中已配置)
      const vector = await embeddingService.getEmbedding(query);
      
      // 2. 去 LanceDB 搜最接近的 Top-3 文本段落
      const results = await vectorDbService.search(Array.from(vector), 3);
      
      // 3. 提取原文
      const context = results.map(r => r.text).join('\n---\n');
      
      // 4. 组装返回长文本
      const prompt = `[系统指令：你是一个顶尖分析师，请严格且仅参考以下【本地绝密事实】回答。若无答案请说不知道。]\n\n【本地事实】：\n${context || '暂无相关事实'}\n\n【用户问题】：${query}`;
      
      return prompt;
    } catch (error) {
      console.error('[KnowledgeService] 搜索知识库失败:', error);
      throw error;
    }
  }
}
