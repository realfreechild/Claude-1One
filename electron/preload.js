// Minimal preload — the app runs entirely as a web app in the renderer.
// No Node.js APIs exposed to the renderer for security.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronApp', {
  platform: process.platform,
});
