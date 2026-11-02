'use strict';
const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
function createWindow() {
  const win = new BrowserWindow({width: 1440, height: 920, minWidth: 760, minHeight: 560, backgroundColor: '#141d19', title: 'MachinaCAD', webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true}});
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(({url}) => { if (url.startsWith('https://')) shell.openExternal(url); return {action:'deny'}; });
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
