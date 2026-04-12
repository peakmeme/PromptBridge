import path from 'path';
import { app } from 'electron';

export class EmbeddingService {
  private extractor: any = null;
  private pipelineFunc: any = null;
  private readonly modelId = 'Xenova/bge-small-zh-v1.5';

  private getLocalModelPath(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'assets', 'models');
    }

    return path.join(process.cwd(), 'assets/models');
  }

  async init() {
    if (this.extractor) return;

    try {
      console.log(`[EmbeddingService] 正在从本地加载模型: ${this.modelId}`);
      
      const { pipeline, env } = await import('@xenova/transformers');
      this.pipelineFunc = pipeline;

      env.localModelPath = this.getLocalModelPath();
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.useBrowserCache = false;

      this.extractor = await this.pipelineFunc('feature-extraction', this.modelId, {
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

    return new Float32Array(output.data);
  }
}

export const embeddingService = new EmbeddingService();
