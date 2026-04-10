import { useState, useCallback, useEffect } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string>('等待拖入文件...');
  const [isProcessing, setIsProcessing] = useState(false);

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 检查当前模式
  const urlParams = new URLSearchParams(window.location.search);
  const isSearchMode = urlParams.get('mode') === 'search';

  useEffect(() => {
    if (isSearchMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          (window as any).api.hideSearchWindow();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchMode]);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      setSearchResult('正在检索本地知识库...');
      try {
        const result = await (window as any).api.searchKnowledge(searchQuery.trim());
        setSearchResult(result);
      } catch (error) {
        console.error('搜索失败:', error);
        setSearchResult('搜索失败，请检查控制台。');
      } finally {
        setIsSearching(false);
      }
    }
  };

  if (isSearchMode) {
    return (
      <div 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'flex-start',
          backgroundColor: 'transparent',
          border: '2px solid red', // 调试用红框
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '20px'
        }}
      >
        <input 
          autoFocus
          placeholder={isSearching ? "正在计算中..." : "输入问题并按回车..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          disabled={isSearching}
          style={{
            width: '100%',
            height: '50px',
            fontSize: '18px',
            padding: '0 15px',
            borderRadius: '10px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}
        />
        <textarea
          readOnly
          value={searchResult}
          placeholder="检索结果将显示在这里..."
          style={{
            width: '100%',
            flex: 1,
            borderRadius: '10px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333',
            resize: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
            fontFamily: 'monospace'
          }}
        />
      </div>
    );
  }

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
        const success = await (window as any).api.processFile(filePath);
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
