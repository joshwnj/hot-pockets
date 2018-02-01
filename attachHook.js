const fs = require('fs')
const falafel = require('falafel')

function parse (src) {
  let localName
  const nodes = {
    requires: []
  }

  nodes.root = falafel(src, function (node) {
    // stop looking after we find an `hp(...)`
    if (nodes.hpCall) { return }

    // credits: https://github.com/stackcss/sheetify/blob/master/transform.js#L95
    if (node.type === 'CallExpression'
        && node.callee && node.callee.name === 'require'
        && node.arguments.length === 1
        && node.arguments[0].value === 'hot-pockets') {
      localName = node.parent.id.name
    }

    if (node.type === 'VariableDeclaration') {
      // Keep track of requires so we can un-hoist them into the hot-pocket.
      // This means we'll always get the new version when a pure module is hot-swapped.
      if (node.source().includes('require(')) {
        nodes.requires.push(node)
      }
    }

    if (node.type === 'MemberExpression'
        && node.object.name === localName
        && node.property.name === 'pure') {
      nodes.pureCall = node.parent
    }

    if (node.type === 'CallExpression'
        && node.callee.name === localName) {
      nodes.hpCall = node
      nodes.hpCallFunc = node.arguments[0]
    }
  })

  return nodes
}

module.exports = function attachHook(sources, pureModules, extension) {
  const existingHook = require.extensions[extension]

  require.extensions[extension] = function hook (m, filename) {
    // ignore 3rd-party modules
    if (filename.includes('node_modules')) {
      return existingHook(m, filename)
    }

    let src = fs.readFileSync(filename, 'utf8')

    if (src.includes('//@hp:pure')) {
      // case: pure module via comment
      pureModules[filename] = true
      return existingHook(m, filename)
    }

    const nodes = parse(src)

    if (nodes.pureCall) {
      // case: pure module
      nodes.pureCall.update(`hp.pure(__filename)`)      
    } else if (nodes.hpCall) {
      // case: hotpocket
      sources[filename] = nodes.root.toString().replace(nodes.hpCallFunc.source(), '')
      nodes.hpCall.update(`hp(__filename, ${nodes.hpCallFunc.source()}, function (src) {
 ${nodes.requires.map(n => n.source()).join('\n')}

 try {
   eval(src)
 } catch (e) {
   console.error('eval fail', e)
   console.error(src)
 }
})`)
    } else {
      // case: no hotpocket calls
      return existingHook(m, filename)
    }
    
    try {
      return m._compile(nodes.root.toString(), filename)
    } catch (e) {
      return m._compile(`
console.error('Syntax error in ${filename}: ' + ${JSON.stringify(e.message)})
console.error(${JSON.stringify(e.stack)})
return

${nodes.root.toString()}
`, filename)
    }
  };
};

module.exports.parse = parse
