import { useState, useCallback, useEffect, useRef } from 'react';

const appleFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';

const styles = {
  appShell: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(120, 171, 255, 0.45), transparent 32%), radial-gradient(circle at top right, rgba(180, 144, 255, 0.32), transparent 28%), linear-gradient(180deg, #eef4ff 0%, #e5edff 45%, #dce7ff 100%)',
    color: '#17314f',
    fontFamily: appleFontStack,
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  ambientOrbPrimary: {
    position: 'absolute' as const,
    width: '34vw',
    height: '34vw',
    minWidth: '260px',
    minHeight: '260px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(175,205,255,0.34) 45%, rgba(175,205,255,0) 75%)',
    filter: 'blur(10px)',
    top: '-8vw',
    left: '-8vw',
    pointerEvents: 'none' as const
  },
  ambientOrbSecondary: {
    position: 'absolute' as const,
    width: '30vw',
    height: '30vw',
    minWidth: '240px',
    minHeight: '240px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(194,168,255,0.28) 45%, rgba(194,168,255,0) 72%)',
    filter: 'blur(14px)',
    right: '-8vw',
    top: '6vh',
    pointerEvents: 'none' as const
  },
  mainLayout: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '40px 24px 32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },
  glassPanel: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.16))',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 20px 60px rgba(90, 120, 173, 0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
    backdropFilter: 'blur(26px) saturate(170%)',
    WebkitBackdropFilter: 'blur(26px) saturate(170%)'
  },
  heroCard: {
    borderRadius: '32px',
    padding: '28px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap' as const
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.38)',
    border: '1px solid rgba(255,255,255,0.46)',
    color: '#31557e',
    fontSize: '12px',
    fontWeight: 600 as const,
    letterSpacing: '0.04em'
  },
  heroTitle: {
    margin: '16px 0 10px',
    fontSize: '42px',
    lineHeight: 1.05,
    fontWeight: 700 as const,
    letterSpacing: '-0.04em',
    color: '#183153'
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: '560px',
    fontSize: '16px',
    lineHeight: 1.7,
    color: 'rgba(34, 56, 86, 0.78)'
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
    gap: '12px',
    minWidth: '240px',
    flex: '0 0 260px'
  },
  statCard: {
    borderRadius: '24px',
    padding: '18px 18px 16px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.18))',
    border: '1px solid rgba(255,255,255,0.48)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700 as const,
    color: '#183153'
  },
  statLabel: {
    marginTop: '8px',
    fontSize: '12px',
    color: 'rgba(49, 85, 126, 0.78)'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: '24px',
    alignItems: 'start'
  },
  sectionCard: {
    borderRadius: '28px',
    padding: '24px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700 as const,
    color: '#1d3557'
  },
  sectionMeta: {
    marginTop: '8px',
    fontSize: '13px',
    color: 'rgba(49, 85, 126, 0.76)'
  },
  dropzone: {
    width: '100%',
    minHeight: '240px',
    marginTop: '20px',
    borderRadius: '28px',
    border: '1px solid rgba(255,255,255,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.18))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.58)',
    transition: 'all 0.28s ease',
    cursor: 'pointer'
  },
  dropzoneInner: {
    textAlign: 'center' as const,
    padding: '28px',
    maxWidth: '420px'
  },
  dropzoneIcon: {
    fontSize: '42px',
    marginBottom: '14px'
  },
  dropzoneStatus: {
    fontSize: '18px',
    fontWeight: 600 as const,
    color: '#17314f'
  },
  dropzoneHint: {
    marginTop: '10px',
    fontSize: '13px',
    color: 'rgba(49, 85, 126, 0.68)',
    lineHeight: 1.6
  },
  fileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  actionButton: {
    border: '1px solid rgba(255,255,255,0.48)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))',
    color: '#204166',
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(105, 137, 192, 0.14)'
  },
  dangerButton: {
    border: '1px solid rgba(255,255,255,0.34)',
    background: 'linear-gradient(180deg, rgba(255, 111, 97, 0.92), rgba(255, 59, 48, 0.82))',
    color: '#fff',
    borderRadius: '999px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 700 as const,
    cursor: 'pointer',
    boxShadow: '0 18px 30px rgba(255, 59, 48, 0.22)',
    opacity: 1,
    transition: 'opacity 0.2s ease'
  },
  fileTable: {
    overflow: 'hidden',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.22)',
    border: '1px solid rgba(255,255,255,0.45)'
  },
  fileTableHeader: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 1fr 80px',
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: 700 as const,
    color: 'rgba(49, 85, 126, 0.8)',
    background: 'rgba(255,255,255,0.26)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  },
  fileTableBody: {
    maxHeight: '360px',
    overflowY: 'auto' as const,
    fontSize: '13px'
  },
  fileRow: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 1fr 80px',
    padding: '14px 16px',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.24)'
  },
  infoCard: {
    borderRadius: '28px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px'
  },
  infoItem: {
    padding: '16px 18px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.24)',
    border: '1px solid rgba(255,255,255,0.38)'
  },
  dbPath: {
    fontSize: '11px',
    color: 'rgba(49, 85, 126, 0.72)',
    wordBreak: 'break-all' as const,
    lineHeight: 1.6
  },
  footerHint: {
    fontSize: '12px',
    color: 'rgba(49, 85, 126, 0.76)',
    lineHeight: 1.7
  },
  searchShell: {
    width: '100vw',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '24px 20px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
    background: 'transparent'
  },
  searchStack: {
    width: '100%',
    maxWidth: '920px',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  searchInputWrap: {
    borderRadius: '30px',
    padding: '12px 14px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.34), rgba(255,255,255,0.12))',
    border: '1px solid rgba(255,255,255,0.42)',
    boxShadow: '0 18px 44px rgba(47, 88, 147, 0.18), inset 0 1px 0 rgba(255,255,255,0.52)',
    backdropFilter: 'blur(24px) saturate(168%)',
    WebkitBackdropFilter: 'blur(24px) saturate(168%)'
  },
  searchInput: {
    width: '100%',
    height: '54px',
    padding: '0 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.14)',
    outline: 'none',
    background: 'rgba(255,255,255,0.26)',
    color: '#16304d',
    fontSize: '18px',
    boxSizing: 'border-box' as const,
    fontFamily: appleFontStack,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.34)'
  },
  toast: {
    position: 'fixed' as const,
    top: '84px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(180deg, rgba(255, 82, 82, 0.96), rgba(255, 59, 48, 0.9))',
    color: 'white',
    padding: '12px 22px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 700 as const,
    boxShadow: '0 12px 32px rgba(255,59,48,0.3)',
    zIndex: 1000,
    border: '1px solid rgba(255,255,255,0.28)'
  },
  resultCard: {
    width: '100%',
    borderRadius: '28px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.34), rgba(255,255,255,0.14))',
    border: '1px solid rgba(255,255,255,0.42)',
    boxShadow: '0 22px 52px rgba(47, 88, 147, 0.18), inset 0 1px 0 rgba(255,255,255,0.52)',
    backdropFilter: 'blur(26px) saturate(170%)',
    WebkitBackdropFilter: 'blur(26px) saturate(170%)'
  },
  resultContent: {
    padding: '20px 20px 58px 20px',
    fontSize: '14px',
    lineHeight: '1.75',
    color: '#17314f',
    overflowY: 'auto' as const,
    maxHeight: '260px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontFamily: appleFontStack
  },
  copyButton: {
    position: 'absolute' as const,
    bottom: '12px',
    right: '12px',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.30)',
    color: '#31557e',
    fontSize: '12px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid rgba(255,255,255,0.36)',
    userSelect: 'none' as const,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)'
  }
};

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string>('等待拖入文件...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [dbPath, setDbPath] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasTyped, setHasTyped] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emptyTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    const query = searchQuery.trim();
    if (!query || isSearching) {
      return;
    }

    try {
      setIsSearching(true);
      setErrorMessage(null);
      setSearchResult('');
      const result = await (window as any).api.searchKnowledge(query);
      setSearchResult(result || '未找到相关结果');
    } catch (error) {
      console.error('搜索失败:', error);
      const message = typeof error === 'string' ? error : '搜索失败，请稍后再试';
      setErrorMessage(message);
      setSearchResult('');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async () => {
    if (!searchResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(searchResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1600);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const resetHideTimer = useCallback((delay: number) => {
    if (!isSearchMode) {
      return;
    }

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      (window as any).api.hideSearchWindow();
    }, delay);
  }, [isSearchMode]);

  useEffect(() => {
    if (!isSearchMode) {
      return;
    }

    resetHideTimer(10000);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        (window as any).api.hideSearchWindow();
      } else {
        resetHideTimer(10000);
      }
    };

    const handleMouseMove = () => resetHideTimer(10000);
    const handleMouseDown = () => resetHideTimer(10000);
    const handleBlur = () => (window as any).api.hideSearchWindow();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('blur', handleBlur);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isSearchMode, resetHideTimer]);

  useEffect(() => {
    if (!isSearchMode) {
      return;
    }

    if (emptyTimerRef.current) {
      clearTimeout(emptyTimerRef.current);
      emptyTimerRef.current = null;
    }

    if (hasTyped && searchQuery.trim() === '') {
      emptyTimerRef.current = setTimeout(() => {
        (window as any).api.hideSearchWindow();
      }, 5000);
    }

    return () => {
      if (emptyTimerRef.current) {
        clearTimeout(emptyTimerRef.current);
      }
    };
  }, [hasTyped, isSearchMode, searchQuery]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body {
        background: transparent;
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .result-container {
        transition: all 0.34s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        transform: translateY(-12px) scale(0.98);
        max-height: 0;
      }
      .result-container.show {
        opacity: 1;
        transform: translateY(0) scale(1);
        max-height: 280px;
      }
      input::placeholder {
        color: rgba(52, 79, 116, 0.58);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      return;
    }

    setIsProcessing(true);
    setStatus(`正在处理 ${files.length} 个文件...`);

    try {
      for (const file of files) {
        setStatus(`正在处理: ${file.name}`);
        await (window as any).api.processFile(file.path);
      }
      setStatus(`处理完成，共导入 ${files.length} 个文件`);
      await fetchFiles();
    } catch (error) {
      console.error('文件处理失败:', error);
      setStatus('处理失败，请查看控制台日志');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    setSelectedFiles((prev) => {
      if (prev.size === indexedFiles.length) {
        return new Set();
      }
      return new Set(indexedFiles);
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) {
      return;
    }

    try {
      await (window as any).api.deleteIndexedFiles(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      await fetchFiles();
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  };

  const handleDeleteSingle = async (filePath: string) => {
    try {
      await (window as any).api.deleteIndexedFiles([filePath]);
      setSelectedFiles((prev) => {
        const next = new Set(prev);
        next.delete(filePath);
        return next;
      });
      await fetchFiles();
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  };

  const handleClearKnowledge = async () => {
    try {
      await (window as any).api.clearKnowledge();
      setSelectedFiles(new Set());
      await fetchFiles();
    } catch (error) {
      console.error('清空知识库失败:', error);
    }
  };

  const handleCopyPath = async (filePath: string) => {
    try {
      await navigator.clipboard.writeText(filePath);
    } catch (error) {
      console.error('复制路径失败:', error);
    }
  };

  if (isSearchMode) {
    return (
      <div style={styles.searchShell}>
        <div style={styles.searchStack}>
          <div style={styles.searchInputWrap}>
            <input
              autoFocus
              placeholder={isSearching ? '正在计算中...' : '输入问题并按回车...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== '') {
                  setHasTyped(true);
                }
              }}
              onKeyDown={handleSearch}
              disabled={isSearching}
              style={styles.searchInput}
            />
          </div>

          {errorMessage && <div style={styles.toast}>{errorMessage}</div>}

          <div className={`result-container ${searchResult ? 'show' : ''}`} style={styles.resultCard}>
            <div className="no-scrollbar" style={styles.resultContent}>
              {searchResult}
            </div>

            {searchResult && (
              <div
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  color: isCopied ? '#34C759' : '#31557e',
                  background: isCopied ? 'rgba(52, 199, 89, 0.16)' : 'rgba(255,255,255,0.30)',
                  border: isCopied ? '1px solid rgba(52, 199, 89, 0.45)' : '1px solid rgba(255,255,255,0.36)'
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

  return (
    <div style={styles.appShell}>
      <div style={styles.ambientOrbPrimary} />
      <div style={styles.ambientOrbSecondary} />

      <div style={styles.mainLayout}>
        <div style={{ ...styles.glassPanel, ...styles.heroCard }}>
          <div>
            <div style={styles.badge}>Liquid Glass Workspace</div>
            <h1 style={styles.heroTitle}>PromptBridge</h1>
            <p style={styles.heroSubtitle}>
              本地隐私记忆中枢与 AI 上下文桥接器，以类似苹果液态玻璃的层次感重构主界面，让拖拽入库、文件管理和状态反馈更轻盈。
            </p>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{indexedFiles.length}</div>
              <div style={styles.statLabel}>已索引文件</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{selectedFiles.size}</div>
              <div style={styles.statLabel}>已选中文件</div>
            </div>
          </div>
        </div>

        <div style={styles.contentGrid}>
          <div style={{ ...styles.glassPanel, ...styles.sectionCard }}>
            <h2 style={styles.sectionTitle}>拖拽导入</h2>
            <div style={styles.sectionMeta}>支持将文件直接拖入窗口，自动完成入库和索引。</div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                ...styles.dropzone,
                border: isDragging ? '1px solid rgba(64, 145, 255, 0.72)' : '1px solid rgba(255,255,255,0.45)',
                background: isDragging
                  ? 'linear-gradient(180deg, rgba(138, 197, 255, 0.26), rgba(255,255,255,0.24))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.18))',
                boxShadow: isDragging
                  ? '0 22px 48px rgba(64, 145, 255, 0.18), inset 0 1px 0 rgba(255,255,255,0.62)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.58)',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              <div style={styles.dropzoneInner}>
                <div style={styles.dropzoneIcon}>{isProcessing ? '⏳' : '🫧'}</div>
                <div style={styles.dropzoneStatus}>{status}</div>
                <div style={styles.dropzoneHint}>拖入文档后将自动解析、切片并写入本地知识库。</div>
              </div>
            </div>
          </div>

          <div style={{ ...styles.glassPanel, ...styles.infoCard }}>
            <div style={styles.infoItem}>
              <h2 style={styles.sectionTitle}>数据库位置</h2>
              <div style={styles.dbPath}>{dbPath || '正在加载数据库路径...'}</div>
            </div>

            <div style={styles.infoItem}>
              <h2 style={styles.sectionTitle}>管理提示</h2>
              <div style={styles.footerHint}>可以批量选择文件删除，也可以直接清空整个知识库。</div>
            </div>

            <button
              type="button"
              onClick={handleClearKnowledge}
              style={{
                ...styles.dangerButton,
                opacity: indexedFiles.length === 0 ? 0.55 : 1,
                cursor: indexedFiles.length === 0 ? 'not-allowed' : 'pointer'
              }}
              disabled={indexedFiles.length === 0}
            >
              清空知识库
            </button>
          </div>
        </div>

        <div style={{ ...styles.glassPanel, ...styles.sectionCard }}>
          <div style={styles.fileHeader}>
            <div>
              <h2 style={styles.sectionTitle}>已索引文件</h2>
              <div style={styles.sectionMeta}>统一管理已进入知识库的文档记录。</div>
            </div>

            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedFiles.size === 0}
              style={{
                ...styles.actionButton,
                opacity: selectedFiles.size === 0 ? 0.5 : 1,
                cursor: selectedFiles.size === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              删除所选
            </button>
          </div>

          <div style={styles.fileTable}>
            <div style={styles.fileTableHeader}>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={indexedFiles.length > 0 && selectedFiles.size === indexedFiles.length}
                  onChange={toggleAllSelection}
                />
              </div>
              <div>文件名</div>
              <div>存储位置</div>
              <div style={{ textAlign: 'center' }}>操作</div>
            </div>

            <div style={styles.fileTableBody}>
              {indexedFiles.length === 0 ? (
                <div style={{ padding: '26px', textAlign: 'center', color: 'rgba(49, 85, 126, 0.7)' }}>
                  暂无索引文件，请先拖入文档。
                </div>
              ) : (
                indexedFiles.map((path) => {
                  const fileName = path.split('/').pop() || path.split('\\').pop() || path;
                  return (
                    <div key={path} style={styles.fileRow}>
                      <div style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(path)}
                          onChange={() => toggleFileSelection(path)}
                        />
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'rgba(49, 85, 126, 0.76)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleCopyPath(path)}
                        title="点击复制路径"
                      >
                        {path}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(path)}
                          style={{
                            ...styles.actionButton,
                            padding: '7px 12px'
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
      </div>
    </div>
  );
}

export default App;
