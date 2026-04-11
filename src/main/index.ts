import { app, shell, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PipelineService } from './PipelineService'
import { KnowledgeService } from './KnowledgeService'

let searchWindow: BrowserWindow | null = null

function createSearchWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const windowWidth = 600
  const windowHeight = 450 // 调高窗口以显示结果

  searchWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor((width - windowWidth) / 2),
    y: Math.floor((height - windowHeight) / 2),
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  searchWindow.on('blur', () => {
    console.log('窗口已隐藏')
    searchWindow?.hide()
  })

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    searchWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?mode=search`)
  } else {
    searchWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { mode: 'search' } })
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('Hello World'))

  // 文件处理全流程流水线处理器
  ipcMain.handle('process-file', async (_, filePath: string) => {
    try {
      return await PipelineService.processFile(filePath)
    } catch (error) {
      console.error('IPC process-file error:', error)
      throw error
    }
  })

  // 隐藏搜索窗口的 IPC
  ipcMain.on('hide-search-window', () => {
    searchWindow?.hide()
  })

  // 搜索知识库的 IPC
  ipcMain.handle('search-knowledge', async (_, query: string) => {
    try {
      return await KnowledgeService.searchKnowledge(query)
    } catch (error: any) {
      console.error('IPC search-knowledge error:', error)
      // 抛出错误给前端
      throw error.message || '搜索失败'
    }
  })

  // 清空知识库的 IPC
  ipcMain.handle('clear-knowledge', async () => {
    try {
      const { vectorDbService } = await import('./VectorDbService')
      return await vectorDbService.clearDatabase()
    } catch (error) {
      console.error('IPC clear-knowledge error:', error)
      throw error
    }
  })

  // 获取文件列表的 IPC
  ipcMain.handle('get-indexed-files', async () => {
    try {
      const { vectorDbService } = await import('./VectorDbService')
      return await vectorDbService.getFiles()
    } catch (error) {
      console.error('IPC get-indexed-files error:', error)
      throw error
    }
  })

  // 删除特定文件的 IPC
  ipcMain.handle('delete-indexed-files', async (_, filePaths: string[]) => {
    try {
      const { vectorDbService } = await import('./VectorDbService')
      return await vectorDbService.deleteFiles(filePaths)
    } catch (error) {
      console.error('IPC delete-indexed-files error:', error)
      throw error
    }
  })

  // 获取数据库路径的 IPC
  ipcMain.handle('get-db-path', async () => {
    try {
      const { vectorDbService } = await import('./VectorDbService')
      return vectorDbService.getDbPath()
    } catch (error) {
      console.error('IPC get-db-path error:', error)
      throw error
    }
  })

  createWindow()
  createSearchWindow()

  // 注册系统全局快捷键 Option+Space
  const ret = globalShortcut.register('Option+Space', () => {
    if (searchWindow?.isVisible()) {
      searchWindow.hide()
    } else {
      searchWindow?.show()
      searchWindow?.focus()
    }
  })

  if (!ret) {
    console.error('[Main] 注册快捷键失败')
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
