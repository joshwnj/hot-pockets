# hot-pockets

Hot-loading with zero build tools.

```js
const hp = require('hot-pockets')

const elem = document.createElement('div')
document.body.appendChild(elem) 

const state = {
  counter: 0
}

hp(() => {
  // When you change something inside the hot-pocket, the code
  // is executed live with no page refresh.
  
  // When you change something outside the hot-pocket the page
  // automatically reloads.
  
  state.counter += 1
  elem.innerHTML = `This pocket has run ${state.counter} times since the last page refresh`
  elem.style.color = 'red'
})
```

## Pure modules

If no `hot-pockets` instructions are found in a module it is considered a "pure" module, and the whole thing will be hot-loaded.

When you save changes to a pure module, any `hp(() => { ... })` that uses it will be re-executed with the new code.

## Ignoring modules

If you know a module causes side-effects, but you don't want to create a hot-pocket, you can tell `hot-pockets` to ignore the module by placing `//@hp:ignore` at the top.

## Status

Working, but still experimental.

At the moment it's only working in `electron` but there's a pretty clear path forward if we want to port it to browser.

Suggestions Welcome! :)

Check out the [example](./example/).
