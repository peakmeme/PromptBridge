import { useState, useCallback } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string>('等待拖入文件...');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Electron 中获取文件真实路径
      const filePath = (file as any).path;
      
      if (!filePath) {
        setStatus('❌ 无法获取文件路径');
        return;
      }

      setIsProcessing(true);
      setStatus(`正在处理: ${file.name}...`);
      console.log(`[Frontend] 发送文件路径给主进程: ${filePath}`);

      try {
        const success = await window.api.processFile(filePath);
        if (success) {
          setStatus('✅ 入库成功');
          console.log('[Frontend] 主进程返回: ✅ 入库成功');
        } else {
          setStatus('❌ 处理失败');
        }
      } catch (error) {
        console.error('[Frontend] IPC 调用出错:', error);
        setStatus(`❌ 出错了: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PromptBridge</h1>
      <p>本地隐私记忆中枢与 AI 上下文桥接器</p>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: '100%',
          height: '200px',
          border: `2px dashed ${isDragging ? '#007AFF' : '#ccc'}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDragging ? 'rgba(0, 122, 255, 0.1)' : '#fafafa',
          transition: 'all 0.3s ease',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          marginTop: '20px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {isProcessing ? (
            <div className="spinner" style={{ marginBottom: '10px' }}>⏳</div>
          ) : (
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
          )}
          <div style={{ color: isProcessing ? '#666' : '#333', fontWeight: 'bold' }}>
            {status}
          </div>
          {!isProcessing && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              支持 PDF, DOCX, TXT 等文件
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        提示：处理过程将在主进程控制台打印详细日志。
      </div>
    </div>
  );
}

export default App;
