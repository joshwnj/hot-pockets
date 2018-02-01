const hp = require('hot-pockets')
const changeString = require('./changeString')

const elem = document.createElement('div')
document.body.appendChild(elem) 

const state = {
  counter: 0
}

hp(() => {
  elem.innerHTML = changeString(`Counter: ${state.counter}`)
  elem.style.color = 'red'

  state.counter += 1
})

