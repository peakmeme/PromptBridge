import { pipeline, env } from '@xenova/transformers';
import path from 'path';

// 配置 transformers.js 使用本地模型，严禁联网
env.localModelPath = path.join(process.cwd(), 'assets/models');
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = false;

export class EmbeddingService {
  private extractor: any = null;
  private readonly modelId = 'Xenova/bge-small-zh-v1.5';

  async init() {
    if (this.extractor) return;

    try {
      console.log(`[EmbeddingService] 正在从本地加载模型: ${this.modelId}`);
      this.extractor = await pipeline('feature-extraction', this.modelId, {
        local_files_only: true,
      });
      console.log('[EmbeddingService] 模型加载成功');
    } catch (error) {
      console.error('[EmbeddingService] 模型加载失败:', error);
      throw error;
    }
  }

  async getEmbedding(text: string): Promise<Float32Array> {
    if (!this.extractor) {
      await this.init();
    }

    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    // 转换为 Float32Array 向量
    return new Float32Array(output.data);
  }
}

export const embeddingService = new EmbeddingService();
