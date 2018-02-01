'use strict'

const { app } = require('electron')
const BrowserWindow = require('hot-pockets/browser-window')

start()

function start () {
  app.on('ready', () => {
    const win = new BrowserWindow({
      width: 500,
      height: 300
    })

    win.loadURL(`file://${__dirname}/browser/index.html`)
  })
}

