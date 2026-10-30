/**
 * electron-builder configuration for Accora Core.
 *
 * Generates a Windows desktop installer (.exe) from the existing
 * Vite build output and the Python backend source.
 *
 * Written as CommonJS (.cjs) for compatibility with the ESM package.json.
 */

/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'com.accoracore.app',
  productName: 'Accora Core',

  directories: {
    output: 'release',
  },

  // Files included inside app.asar (the Electron archive).
  files: [
    'dist/**',          // Vite build output
    'electron/**',      // Main + preload scripts
    'package.json',
  ],

  // Resources placed alongside the asar (accessible at runtime via process.resourcesPath).
  extraResources: [
    {
      from: '../backend',
      to: 'backend',
      filter: ['**/*', '!__pycache__', '!.venv', '!*.pyc', '!.env'],
    },
  ],

  // Do not wrap in asar — Python must access its source files directly.
  asar: false,

  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
    // Uncomment and supply an .ico file when available:
    // icon: 'build/icon.ico',
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Accora Core',
  },

  portable: {
    artifactFileName: 'Accora-Core-Portable.exe',
  },
};

module.exports = config;
