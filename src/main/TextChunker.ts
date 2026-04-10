/**
 * 文本切片工具类
 * 决定 AI 智商下限的核心算法：确保长句不被拦腰切断，并保持语义重叠
 */
export class TextChunker {
  /**
   * 将长文本切割成带有重叠区的切片
   * @param text 原始文本
   * @param chunkSize 每个切片的最大字数 (默认 400)
   * @param overlapSize 重叠区字数 (默认 50)
   * @returns 切片数组
   */
  public static chunk(
    text: string,
    chunkSize: number = 400,
    overlapSize: number = 50
  ): string[] {
    if (!text || text.length <= chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let currentStart = 0;

    while (currentStart < text.length) {
      // 1. 计算初步结束位置
      let currentEnd = currentStart + chunkSize;

      // 如果超出文本长度，截取剩余所有并结束
      if (currentEnd >= text.length) {
        chunks.push(text.slice(currentStart).trim());
        break;
      }

      // 2. 寻找最优切割点 (句号、换行等)
      const subText = text.slice(currentStart, currentEnd);
      const lastSeparator = Math.max(
        subText.lastIndexOf('。'),
        subText.lastIndexOf('\n'),
        subText.lastIndexOf('！'),
        subText.lastIndexOf('？')
      );

      // 如果在后半段找到了分隔符，则在该处切割
      if (lastSeparator !== -1 && lastSeparator > chunkSize * 0.4) {
        currentEnd = currentStart + lastSeparator + 1;
      }

      // 3. 存储当前切片
      const chunk = text.slice(currentStart, currentEnd).trim();
      if (chunk) {
        chunks.push(chunk);
      }

      // 4. 计算下一个起始位置：本次结束位置 - 重叠区大小
      const nextStart = currentEnd - overlapSize;

      // 5. 步进防护：确保下一次的起始位置一定比本次起始位置更靠后
      if (nextStart <= currentStart) {
        currentStart = currentEnd; // 如果没法重叠，则直接从当前结束位置开始
      } else {
        currentStart = nextStart;
      }

      if (currentStart >= text.length) break;
    }

    return chunks;
  }
}
