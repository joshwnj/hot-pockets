const { BrowserWindow } = require('electron')
const fs = require('fs')
const chokidar = require('chokidar')
const path = require('path')

const dir = process.cwd()

module.exports = function (opts) {
  const win = new BrowserWindow(Object.assign({}, opts, {
    webPreferences: Object.assign({}, opts.webPreferences || {}, {
      preload: path.join(__dirname, 'index.js')
    })
  }))

  const watcher = chokidar.watch(dir + '/**/*.js', {
    ignored: '**/node_modules/**'
  })

  watcher.on('change', (f) => {
    win.webContents.send('hp:file-changed', f)
  })
  
  return win
}
