import { embeddingService } from './src/main/EmbeddingService';
import { vectorDbService } from './src/main/VectorDbService';
import OpenAI from 'openai';
import path from 'path';
import os from 'os';

/**
 * 脱离 Electron 的纯 Node 脚本：RAG 闭环测试
 * 1. 接收问题参数
 * 2. 向量化问题
 * 3. LanceDB 向量检索 (Top-3)
 * 4. 组装 超级提示词
 * 5. 调用 OpenAI GPT-4o
 */
async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('❌ 请输入问题，例如: npx tsx test-qa.ts "违约金比例是多少？"');
    process.exit(1);
  }

  // 1. 初始化数据库路径 (由于脱离了 Electron，我们需要手动指定 appData 路径或使用 Electron 开发环境路径)
  // 这里我们默认使用 Electron 之前生成的真实数据库路径
  const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'peakmeme');
  // 如果您之前运行的是 test-lancedb.ts，请使用 peakmeme-test 目录
  // const userDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'peakmeme-test');

  console.log(`\n--- [RAG 闭环质检开始] ---`);
  console.log(`问题: "${query}"`);

  try {
    // 2. 将问题向量化
    console.log(`\n[Step 1] 正在向量化问题...`);
    const queryVector = await embeddingService.getEmbedding(query);
    const vectorArray = Array.from(queryVector);

    // 3. 执行本地向量检索
    console.log(`\n[Step 2] 正在检索本地 LanceDB...`);
    const searchResults = await vectorDbService.search(vectorArray, 3);

    if (searchResults.length === 0) {
      console.log('⚠️ 数据库中没有找到相关片段，请先通过 Electron 界面拖入文件入库。');
      return;
    }

    // 4. 组装超级提示词
    console.log(`\n[Step 3] 组装超级提示词 (Context Assembly)...`);
    const context = searchResults.map((res, i) => `[参考片段 ${i + 1}]:\n${res.text}`).join('\n\n');
    
    console.log('\n--- [本地检索到的原文片段] ---');
    console.log(context);
    console.log('-----------------------------\n');

    const systemPrompt = `你是一个专业的助手。请仅根据提供的参考片段回答用户的问题。如果参考片段中没有相关信息，请诚实告知。
不要胡编乱造。如果片段中提到了具体的比例、数字或金额，请务必准确提取。`;

    const userPrompt = `参考片段：\n${context}\n\n问题：${query}\n\n请给出简洁、准确的回答。`;

    // 5. 调用 OpenAI (需要环境变量 OPENAI_API_KEY)
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ 未检测到 OPENAI_API_KEY 环境变量，仅展示本地检索结果。');
      console.log('提示: 您可以执行 export OPENAI_API_KEY="sk-..." 后重新运行。');
      return;
    }

    console.log(`[Step 4] 正在请求云端裁判 (GPT-4o)...`);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // 如果需要中转地址，可以配置 baseURL
      // baseURL: 'https://api.openai-proxy.org/v1' 
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0
    });

    console.log('\n--- [GPT-4o 的回答] ---');
    console.log(completion.choices[0].message.content);
    console.log('-----------------------\n');

  } catch (error) {
    console.error('❌ RAG 流程失败:', error);
  }
}

main();
