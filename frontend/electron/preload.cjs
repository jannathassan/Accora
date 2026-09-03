/**
 * Accora — Electron preload script.
 *
 * Exposes a minimal, safe API to the renderer process via contextBridge.
 * The renderer can detect Electron by checking  window.electronAPI.
 */

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** Allows the renderer to detect it is running inside Electron. */
  isElectron: true,
});
