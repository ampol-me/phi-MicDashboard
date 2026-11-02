import { app, BrowserWindow } from 'electron'
import path from 'path'

// ป้องกันการ garbage collection
let mainWindow: BrowserWindow | null = null

function createWindow() {
  // สร้าง browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // โหลด URL ของแอพ
  if (process.env.NODE_ENV === 'development') {
    // Development mode - โหลดจาก localhost
    mainWindow.loadURL('http://localhost:3000')
    // เปิด DevTools
    mainWindow.webContents.openDevTools()
  } else {
    // Production mode - โหลดจากไฟล์
    mainWindow.loadFile(path.join(__dirname, '../../.output/public/index.html'))
  }

  // จัดการเมื่อปิดหน้าต่าง
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// เมื่อ Electron พร้อมทำงาน
app.whenReady().then(createWindow)

// จัดการเมื่อปิดหน้าต่างทั้งหมด
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
}) 