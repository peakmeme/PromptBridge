import { KnowledgeService } from './src/main/KnowledgeService';

async function runTest() {
  const query = "违约金是多少？";
  console.log(`\n--- [搜索知识库测试] ---`);
  console.log(`用户问题: "${query}"`);

  try {
    const prompt = await KnowledgeService.searchKnowledge(query);
    console.log(`\n--- [组装好的提示词] ---`);
    console.log(prompt);
    console.log(`\n--- [测试结束] ---`);
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

runTest();
