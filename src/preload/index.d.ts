import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ping: () => void;
      processFile: (filePath: string) => Promise<boolean>;
      hideSearchWindow: () => void;
      searchKnowledge: (query: string) => Promise<string>;
      clearKnowledge: () => Promise<boolean>;
      getIndexedFiles: () => Promise<string[]>;
      deleteIndexedFiles: (filePaths: string[]) => Promise<boolean>;
      getDbPath: () => Promise<string>;
    }
  }
}
