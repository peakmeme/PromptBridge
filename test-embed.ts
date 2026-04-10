import { pipeline, env } from '@xenova/transformers';
import path from 'path';

// 配置 transformers.js 使用本地模型
env.localModelPath = path.join(process.cwd(), 'assets/models');
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = false; // 在 Node.js 中禁用浏览器缓存相关逻辑

async function runTest() {
  const modelId = 'Xenova/bge-small-zh-v1.5';
  
  console.log(`正在加载模型: ${modelId}...`);
  
  try {
    // 加载特征提取流水线
    const extractor = await pipeline('feature-extraction', modelId, {
      local_files_only: true,
    });

    const testText = '这是一个测试文本';
    console.log(`测试文本: "${testText}"`);

    // 执行推理
    const output = await extractor(testText, { 
      pooling: 'mean', 
      normalize: true 
    });

    // 转换为 Float32Array
    const vector = new Float32Array(output.data);
    
    console.log('\n--- 预期结果 ---');
    console.log('向量维度 (length):', vector.length);
    console.log('前 5 个数值:', Array.from(vector.slice(0, 5)));
    
  } catch (error) {
    console.error('加载或运行模型时出错:', error);
    console.log('\n提示: 请确保已经运行了 npm install @xenova/transformers');
  }
}

runTest();
