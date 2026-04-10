import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export class DocParser {
  /**
   * 提取本地文件的纯文本
   * @param filePath 本地文件的绝对路径
   * @returns 提取后的纯文本
   */
  public static async parseFile(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const extension = filePath.split('.').pop()?.toLowerCase();
    let text = '';

    try {
      if (extension === 'pdf') {
        text = await this.parsePdf(filePath);
      } else if (extension === 'docx') {
        text = await this.parseDocx(filePath);
      } else {
        // 默认作为普通文本读取
        text = fs.readFileSync(filePath, 'utf-8');
      }

      // 去掉多余的空格和空行
      const cleanedText = this.cleanText(text);
      
      console.log(`--- [DocParser] 解析完成: ${filePath} ---`);
      // console.log(cleanedText); // 用户要求在控制台打印出来，但为了避免大文件刷屏，测试脚本会截取

      return cleanedText;
    } catch (error) {
      console.error(`解析文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 解析 PDF 文件
   */
  private static async parsePdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  /**
   * 解析 Word (.docx) 文件
   */
  private static async parseDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * 清理文本：去掉多余的空格和空行
   */
  private static cleanText(text: string): string {
    return text
      .split('\n')
      .map(line => line.trim()) // 去掉每行首尾空格
      .filter(line => line.length > 0) // 去掉空行
      .join('\n') // 重新合并
      .replace(/[ \t]+/g, ' '); // 将多个连续空格/制表符替换为一个空格
  }
}
