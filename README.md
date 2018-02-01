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

When you have a module that causes no side-effects, and just exports a function or a value, we can tell `hot-pockets` to hot-load the whole thing by putting `//@hp:pure` at the top. When you save changes to a pure module, any `hp(() => { ... })` that uses it will be re-executed with the new code.

## Status

Working, but still experimental.

At the moment it's only working in `electron` but there's a pretty clear path forward if we want to port it to browser.

Suggestions Welcome! :)

Check out the [example](./example/).
