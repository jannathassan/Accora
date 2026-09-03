/**
 * Accora — Electron main process.
 *
 * Responsibilities:
 *   1. Create and manage the application window.
 *   2. Start / stop the Python FastAPI backend as a child process.
 *   3. Load the Vite-built frontend (dev server or production build).
 *
 * Written as CommonJS (.cjs) so it works regardless of the package.json
 * "type" field (which is "module" for the Vite frontend).
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

/* ── Paths ─────────────────────────────────────────────────────────── */

// In development the Electron files live at  frontend/electron/
// In a packaged build they are inside  resources/app.asar/electron/
const FRONTEND_DIR = path.join(__dirname, '..');
const PROJECT_ROOT = path.join(FRONTEND_DIR, '..');

const BACKEND_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(PROJECT_ROOT, 'backend');

/* ── Settings ──────────────────────────────────────────────────────── */

const IS_DEV = !app.isPackaged && process.env.ACCORA_DEV === '1';
const BACKEND_PORT = 8000;
const DEV_SERVER_URL = 'http://localhost:5173';

/* ── State ─────────────────────────────────────────────────────────── */

/** @type {BrowserWindow|null} */
let mainWindow = null;

/** @type {import('child_process').ChildProcess|null} */
let backendProcess = null;

/* ── Window ────────────────────────────────────────────────────────── */

function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Accora',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Show only after the renderer has painted — avoids a white flash.
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  // Open external links in the system browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (IS_DEV) {
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(FRONTEND_DIR, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ── Backend management ────────────────────────────────────────────── */

function startBackend() {
  return new Promise((resolve, reject) => {
    const pythonExe = process.platform === 'win32' ? 'python' : 'python3';

    backendProcess = spawn(
      pythonExe,
      ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)],
      {
        cwd: BACKEND_DIR,
        env: {
          ...process.env,
          ACCORA_DEMO_MODE: 'true',
          ACCORA_AI_PROVIDER: 'mock',
          // Allow the Electron origin for CORS
          ACCORA_CORS_ORIGINS: `["http://localhost:${BACKEND_PORT}","file://"]`,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    backendProcess.stdout?.on('data', (d) => {
      process.stdout.write(`[backend] ${d}`);
    });

    backendProcess.stderr?.on('data', (d) => {
      process.stderr.write(`[backend] ${d}`);
    });

    backendProcess.on('error', (err) => {
      console.error('[electron] Failed to start backend:', err.message);
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.error(`[electron] Backend exited with code ${code}`);
      }
      backendProcess = null;
    });

    // Give the process a moment to start, then poll for readiness.
    waitForBackend().then(resolve).catch(reject);
  });
}

/**
 * Poll GET http://localhost:8000/ until the backend responds.
 * Tries up to 60 times with a 500 ms interval (30 s total).
 */
function waitForBackend() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60;

    (function check() {
      attempts++;
      const req = http.get(`http://localhost:${BACKEND_PORT}/`, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Backend did not become ready in time.'));
        }
      });

      req.on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Backend did not become ready in time.'));
        }
      });

      req.setTimeout(1000, () => req.destroy());
    })();
  });
}

function shutdownBackend() {
  if (!backendProcess) return;

  if (process.platform === 'win32' && backendProcess.pid) {
    spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t']);
  } else {
    backendProcess.kill('SIGTERM');
    // Force-kill after 5 s if still alive.
    setTimeout(() => {
      if (backendProcess) backendProcess.kill('SIGKILL');
    }, 5000);
  }

  backendProcess = null;
}

/* ── App lifecycle ─────────────────────────────────────────────────── */

app.whenReady().then(async () => {
  try {
    // In production (non-dev), start the embedded backend.
    if (!IS_DEV) {
      console.log('[electron] Starting backend...');
      await startBackend();
      console.log('[electron] Backend is ready.');
    }
  } catch (err) {
    console.error('[electron] Backend startup failed:', err);
    // Continue anyway — the frontend will show its own error state.
  }

  createWindow();

  // macOS: re-create window when dock icon is clicked.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  shutdownBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  shutdownBackend();
});
