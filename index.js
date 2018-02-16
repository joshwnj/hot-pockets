const attachHook = require('./attachHook')
const ipc = require('electron').ipcRenderer
const _funcs = []

const sources = {}
const updateSrcs = {}
const evalFuncs = {}
const pureModules = {}

const fs = require('fs')
ipc.on('hp:file-changed', (event, f) => {
  fs.readFile(f, 'utf-8', (err, raw) => {
    const { root, hpCallFunc } = attachHook.parse(raw)

    if (pureModules[f]) {
      // when a pure module changes,
      // - delete the module cache
      // - re-run all hotpockets
      delete require.cache[f]
      
      Object.keys(evalFuncs).forEach(f => {
        evalFuncs[f]('(' + updateSrcs[f] + ')()')
      })
      return
    }

    if (hasNonHpChanges(sources[f], { root, hpCallFunc })) {
      location.reload()
      return
    }

    if (hpCallFunc && evalFuncs[f]) {
      evalFuncs[f]('(' + hpCallFunc.source() + ')()')
    }
  })
})

attachHook(sources, pureModules, {
  extension: '.js',
  pauseOnEvalError: true
})

module.exports = function (filename, updateFunc, evalFunc) {
  // handle case where source has not been transformed by attachHook
  if (typeof filename === 'function') {
    filename()
    return
  }

  updateSrcs[filename] = updateFunc.toString()
  evalFuncs[filename] = evalFunc

  // call update once to start
  updateFunc()
}

module.exports.pure = function (filename) {
  pureModules[filename] = true
}

function hasNonHpChanges (oldSrc, { root, hpCallFunc }) {
  // if there's no hotpocket, every change is a non-hp change
  if (!hpCallFunc) { return true }

  const newSrc = root.toString().replace(hpCallFunc.source(), '')
  return oldSrc !== newSrc
}
