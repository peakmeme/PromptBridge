import { useState, useCallback, useEffect, useRef } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string>('等待拖入文件...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [dbPath, setDbPath] = useState<string>('');

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasTyped, setHasTyped] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emptyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 检查当前模式
  const urlParams = new URLSearchParams(window.location.search);
  const isSearchMode = urlParams.get('mode') === 'search';

  const fetchFiles = useCallback(async () => {
    try {
      console.log('[Frontend] 正在获取文件列表...');
      const files = await (window as any).api.getIndexedFiles();
      console.log('[Frontend] 获取到文件列表:', files);
      setIndexedFiles(files);
      
      const path = await (window as any).api.getDbPath();
      setDbPath(path);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  }, []);

  useEffect(() => {
    if (!isSearchMode) {
      fetchFiles();
    }
  }, [isSearchMode, fetchFiles]);

  // 清空状态的函数
  const clearSearchState = useCallback(() => {
    setSearchQuery('');
    setSearchResult('');
    setIsSearching(false);
    setIsCopied(false);
    setErrorMessage(null);
    setHasTyped(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current);
  }, []);

  useEffect(() => {
    if (isSearchMode) {
      // 1. 处理 10秒不打字自动退出 (Idle Timer)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        console.log('[Timer] 10s idle, hiding window');
        clearSearchState();
        (window as any).api.hideSearchWindow();
      }, 10000);

      // 2. 处理 清空搜索框后 5秒自动退出 (Empty Timer)
      // 如果曾经输入过内容且现在为空，开启 5秒 计时器
      if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current);
      if (hasTyped && searchQuery.trim() === '') {
        emptyTimerRef.current = setTimeout(() => {
          console.log('[Timer] 5s empty, hiding window');
          clearSearchState();
          (window as any).api.hideSearchWindow();
        }, 5000);
      }

      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current);
      };
    }
    return undefined;
  }, [isSearchMode, searchQuery, hasTyped, clearSearchState]);

  useEffect(() => {
    if (isSearchMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          clearSearchState();
          (window as any).api.hideSearchWindow();
        }
      };
      const handleBlur = () => {
        // 当窗口失去焦点时，也清空状态并通知主进程隐藏（防呆）
        clearSearchState();
        (window as any).api.hideSearchWindow();
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleBlur);

      // 注入隐藏滚动条的样式
      const style = document.createElement('style');
      style.textContent = `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .result-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(-10px);
          max-height: 0;
        }
        .result-container.show {
          opacity: 1;
          transform: translateY(0);
          max-height: 250px;
        }
      `;
      document.head.appendChild(style);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleBlur);
        document.head.removeChild(style);
      };
    }
    return undefined;
  }, [isSearchMode, clearSearchState]);

  const handleCopy = async () => {
    if (!searchResult) return;
    try {
      await navigator.clipboard.writeText(searchResult);
      setIsCopied(true);
      
      // 1.5秒后隐藏并清空
      setTimeout(() => {
        (window as any).api.hideSearchWindow();
        // 核心防呆：在隐藏后/同时清空状态
        setTimeout(clearSearchState, 100); 
      }, 1500);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      setIsCopied(false);
      setSearchResult(''); // 先清空，为了触发展开动画
      setErrorMessage(null); // 清空错误

      try {
        const result = await (window as any).api.searchKnowledge(searchQuery.trim());
        setSearchResult(result);
      } catch (error: any) {
        console.error('搜索失败:', error);
        // 如果是空库或错误，设置错误消息
        const msg = error.message || String(error);
        setErrorMessage(msg.includes('DATABASE_EMPTY') || msg.includes('请先拖拽') ? msg : `❌ ${msg}`);
        
        // 3秒后自动清除错误提示
        setTimeout(() => setErrorMessage(null), 3000);
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
          // border: '2px solid red', // 移除调试用红框
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '10px 20px'
        }}
      >
        <div style={{ width: '100%', position: 'relative' }}>
          <input 
            autoFocus
            placeholder={isSearching ? "正在计算中..." : "输入问题并按回车..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() !== '') {
                setHasTyped(true);
              }
            }}
            onKeyDown={handleSearch}
            disabled={isSearching}
            style={{
              width: '100%',
              height: '50px',
              fontSize: '18px',
              padding: '0 15px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.1)',
              outline: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              marginBottom: '10px',
              boxSizing: 'border-box'
          }}
        />

        {/* Toast 错误提示 */}
        {errorMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ff3b30',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}>
            {errorMessage}
          </div>
        )}

        {/* 结果展示区 */}
          <div 
            className={`result-container ${searchResult ? 'show' : ''}`}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <div 
              className="no-scrollbar"
              style={{
                padding: '15px 15px 45px 15px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#2c3e50',
                overflowY: 'auto',
                maxHeight: '250px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {searchResult}
            </div>

            {/* 复制按钮 */}
            {searchResult && (
              <div 
                onClick={handleCopy}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: isCopied ? 'rgba(52, 199, 89, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: isCopied ? '#34C759' : '#666',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: isCopied ? '1px solid #34C759' : '1px solid transparent',
                  userSelect: 'none'
                }}
              >
                {isCopied ? '✅ 已复制' : '📋 复制'}
              </div>
            )}
          </div>
        </div>
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
          
          // 给数据库一点点刷新的时间（针对 LanceDB 的一些并发场景）
          setTimeout(fetchFiles, 300); 
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
  }, [fetchFiles]); // 添加 fetchFiles 到依赖项

  const handleClearDb = async () => {
    if (!window.confirm('确定要清空本地知识库吗？这将物理删除所有已索引的数据，且不可恢复。')) {
      return;
    }

    setIsProcessing(true);
    setStatus('正在清空知识库...');
    try {
      const success = await (window as any).api.clearKnowledge();
      if (success) {
        setStatus('✅ 知识库已物理清空');
        console.log('[Frontend] 知识库已物理清空');
        setIndexedFiles([]); // 清空文件列表
        setSelectedFiles(new Set()); // 清空选中
      } else {
        setStatus('❌ 清空失败');
      }
    } catch (error) {
      console.error('[Frontend] 清空失败:', error);
      setStatus(`❌ 清空失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFiles = async (paths: string[]) => {
    if (!window.confirm(`确定要删除选中的 ${paths.length} 个文件吗？这将物理删除数据库中关联的所有向量数据。`)) {
      return;
    }

    setIsProcessing(true);
    setStatus('正在删除文件...');
    try {
      const success = await (window as any).api.deleteIndexedFiles(paths);
      if (success) {
        setStatus(`✅ 已删除 ${paths.length} 个文件`);
        setSelectedFiles(new Set()); // 清空选中
        fetchFiles(); // 刷新列表
      } else {
        setStatus('❌ 删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      setStatus(`❌ 删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFileSelection = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedFiles.size === indexedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(indexedFiles));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const fileName = text.split('/').pop() || text.split('\\').pop() || '路径';
      setStatus(`✅ 已复制: ${fileName}`);
      setTimeout(() => setStatus('等待拖入文件...'), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

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

      {/* 文件明细列表 */}
      <div style={{ marginTop: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
            📂 知识库文件明细 ({indexedFiles.length})
          </h3>
          {selectedFiles.size > 0 && (
            <button
              onClick={() => handleDeleteFiles(Array.from(selectedFiles))}
              style={{
                backgroundColor: '#ff3b30',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              批量删除 ({selectedFiles.size})
            </button>
          )}
        </div>

        <div style={{ 
          border: '1px solid #eee', 
          borderRadius: '10px', 
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '40px 1fr 1fr 80px', 
            backgroundColor: '#f8f8f8',
            padding: '10px',
            borderBottom: '1px solid #eee',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input 
                type="checkbox" 
                checked={indexedFiles.length > 0 && selectedFiles.size === indexedFiles.length}
                onChange={toggleAllSelection}
              />
            </div>
            <div>文件名</div>
            <div>存储位置 (点击复制)</div>
            <div style={{ textAlign: 'center' }}>操作</div>
          </div>

          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            fontSize: '13px'
          }}>
            {indexedFiles.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                暂无索引文件，请先拖入文档。
              </div>
            ) : (
              indexedFiles.map((path) => {
                const fileName = path.split('/').pop() || path.split('\\').pop() || path;
                return (
                  <div key={path} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '40px 1fr 1fr 80px', 
                    padding: '10px',
                    borderBottom: '1px solid #f9f9f9',
                    alignItems: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedFiles.has(path)}
                        onChange={() => toggleFileSelection(path)}
                      />
                    </div>
                    <div style={{ fontWeight: '500', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fileName}>
                      {fileName}
                    </div>
                    <div 
                      onClick={() => copyToClipboard(path)}
                      style={{ 
                        color: '#999', 
                        fontSize: '11px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        cursor: 'copy',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }} 
                      title="点击复制完整路径"
                      onMouseOver={(e) => (e.currentTarget.style.color = '#007AFF')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#999')}
                    >
                      <span style={{ fontSize: '10px' }}>📋</span>
                      {path}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteFiles([path])}
                        style={{ 
                          color: '#ff3b30', 
                          border: 'none', 
                          background: 'none', 
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        提示：处理过程将在主进程控制台打印详细日志。
      </div>

      {dbPath && (
        <div style={{ 
          marginTop: '10px', 
          fontSize: '10px', 
          color: '#aaa',
          padding: '8px',
          backgroundColor: '#fcfcfc',
          borderRadius: '4px',
          wordBreak: 'break-all',
          border: '1px solid #f0f0f0'
        }}>
          🏠 数据库物理路径: {dbPath}
        </div>
      )}

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button
          onClick={handleClearDb}
          disabled={isProcessing}
          style={{
            backgroundColor: '#ff3b30',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(255,59,48,0.2)',
            transition: 'all 0.2s ease',
            opacity: isProcessing ? 0.6 : 1
          }}
          onMouseOver={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#d32f2f')}
          onMouseOut={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#ff3b30')}
        >
          🗑️ 一键清空本地知识库
        </button>
      </div>
    </div>
  );
}

export default App;
