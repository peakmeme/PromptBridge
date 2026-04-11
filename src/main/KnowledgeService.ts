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
      // 1. 检查数据库是否为空 (边界拦截)
      const rowCount = await vectorDbService.count();
      if (rowCount === 0) {
        throw new Error('DATABASE_EMPTY');
      }

      // 2. 获取 query 的向量
      const vector = await embeddingService.getEmbedding(query);
      
      // 3. 去 LanceDB 搜最接近的 Top-3 文本段落
      const results = await vectorDbService.search(Array.from(vector), 3);
      
      if (!results || results.length === 0) {
        return '未找到相关事实，请确认知识库内容。';
      }

      // 4. 提取原文
      const context = results.map(r => r.text).join('\n---\n');
      
      // 5. 组装返回长文本
      const prompt = `[系统指令：你是一个顶尖分析师，请严格且仅参考以下【本地绝密事实】回答。若无答案请说不知道。]\n\n【本地事实】：\n${context || '暂无相关事实'}\n\n【用户问题】：${query}`;
      
      return prompt;
    } catch (error: any) {
      console.error('[KnowledgeService] 搜索知识库失败:', error);
      // 捕获特定错误并向上传递友好提示
      if (error.message === 'DATABASE_EMPTY') {
        throw new Error('请先拖拽文档建立知识库，当前数据库为空。');
      }
      throw new Error(`检索失败: ${error.message || '未知错误'}`);
    }
  }
}
