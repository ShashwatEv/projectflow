const { app, BrowserWindow, desktopCapturer, dialog, ipcMain, net, protocol, session, shell } = require('electron');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'projectflow-app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
  { scheme: 'projectflow', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();

let mainWindow;
let viteProcess;
let pendingAuthUrl;

function isAuthCallback(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'projectflow:' && url.hostname === 'auth' && url.pathname === '/callback';
  } catch {
    return false;
  }
}

function deliverAuthCallback(value) {
  if (!isAuthCallback(value)) return;
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.isLoading() === false) {
    mainWindow.webContents.send('auth:callback', value);
  } else {
    pendingAuthUrl = value;
  }
}

function waitForVite(url) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });
      request.on('error', () => {
        if (Date.now() - startedAt > 30000) {
          reject(new Error('Vite did not start within 30 seconds.'));
          return;
        }
        setTimeout(check, 250);
      });
    };
    check();
  });
}

async function startDevServer() {
  const projectRoot = path.resolve(__dirname, '..');
  const viteCli = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const nodeExecutable = process.env.npm_node_execpath || 'node';
  viteProcess = spawn(nodeExecutable, [viteCli, '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
    cwd: projectRoot,
    stdio: 'inherit',
    windowsHide: true,
  });
  viteProcess.once('error', (error) => console.error('Could not start Vite:', error));
  await waitForVite('http://127.0.0.1:5173');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = app.isPackaged
        ? url.startsWith('projectflow-app://bundle/')
      : url.startsWith('http://127.0.0.1:5173/');
    if (!allowed) event.preventDefault();
  });
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(webContents.id === mainWindow.webContents.id && permission === 'media');
  });

  if (app.isPackaged) {
    await mainWindow.loadURL('projectflow-app://bundle/index.html');
  } else {
    await mainWindow.loadURL('http://127.0.0.1:5173');
  }

  if (pendingAuthUrl) {
    mainWindow.webContents.send('auth:callback', pendingAuthUrl);
    pendingAuthUrl = undefined;
  }
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  deliverAuthCallback(url);
});

const initialAuthUrl = process.argv.find((arg) => arg.startsWith('projectflow://'));
if (initialAuthUrl) pendingAuthUrl = initialAuthUrl;

app.whenReady().then(async () => {
  if (!hasSingleInstanceLock) return;
  app.setAsDefaultProtocolClient('projectflow');

  const distDirectory = path.resolve(__dirname, '..', 'dist');
  protocol.handle('projectflow-app', (request) => {
    try {
      const requestUrl = new URL(request.url);
      if (requestUrl.hostname !== 'bundle') return new Response('Not found', { status: 404 });
      const filePath = path.resolve(distDirectory, `.${decodeURIComponent(requestUrl.pathname)}`);
      if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${path.sep}`)) {
        return new Response('Not found', { status: 404 });
      }
      return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
      console.error('Could not serve desktop app asset:', error);
      return new Response('Not found', { status: 404 });
    }
  });

  ipcMain.handle('desktop:open-external', async (_event, value) => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs can be opened externally.');
      }
      await shell.openExternal(url.toString());
    } catch (error) {
      console.error('Could not open external URL:', error);
      throw error;
    }
  });

  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 0, height: 0 },
      });
      if (!sources.length || !mainWindow || mainWindow.isDestroyed()) {
        callback({});
        return;
      }

      const labels = sources.map((source) => source.name);
      const cancelId = labels.length;
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: 'Choose what to share',
        message: 'Select a screen or window to share. Nothing is captured until you choose one.',
        buttons: [...labels, 'Cancel'],
        cancelId,
        defaultId: cancelId,
        noLink: true,
      });
      callback(response === cancelId ? {} : { video: sources[response] });
    } catch (error) {
      console.error('Could not select a screen-share source:', error);
      callback({});
    }
  }, { useSystemPicker: false });

  if (!app.isPackaged) await startDevServer();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on('second-instance', (_event, commandLine) => {
  const authUrl = commandLine.find((arg) => arg.startsWith('projectflow://'));
  if (authUrl) deliverAuthCallback(authUrl);
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (viteProcess && !viteProcess.killed) viteProcess.kill();
});
