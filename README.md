redux-on
==============

[![build status](https://img.shields.io/travis/gaearon/redux-thunk/master.svg?style=flat-square)](https://travis-ci.org/gaearon/redux-thunk)
[![npm version](https://img.shields.io/npm/v/redux-thunk.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk)
[![npm downloads](https://img.shields.io/npm/dm/redux-thunk.svg?style=flat-square)](https://www.npmjs.com/package/redux-thunk)

Store enhancer for [redux](https://github.com/reactjs/redux) which support accurately subscribe.

## Install

```js
npm i --save redux-on
```

## Usage

```js
import { createStore, applyMiddleware, compose } from 'redux'
import accuratelySubscribe from 'redux-on'

const enhancer = compose(
  applyMiddleware(...middleware),
  accuratelySubscribe()
)

const store = createStore(reducer, initialState, enhancer)
// example
const off = store.on((prevState, state) => {
  return prevState.user !== state.user
}, (prevState, state) => {
  alert(`Hi, ${state.user.name}, welcome!`)
})
```

## Api

#### on([type], [predicate], handler, [once])

Adds a change handler. It will be called any time an action with specified type dispatched
or successful predication.

###### Arguments
1. `type` (String): The type of action.
2. `predicate` (Function): The predicate logic. It will be called with two parameters: `prevState`, `state`.
3. `handler` (Function): The change handler. It will be called with two parameters: `prevState`, `state`.
4. `once` (Function): Whether to handle change only once. Default `false`.

###### Returns
(Function): A function that drop the change handler.

###### Examples
```js
// listen customer change by action type.
const off = store.on('CUSTOMER', (prevState, state) => {
  alert(`Hi, ${state.customer.name}! welcome to the bar.`)
})
// listen customer change by predication.
const off1 = store.on(
  (prevState, state) => prevState.customer !== state.customer,
  (prevState, state) => alert(`Hi, ${state.customer.name}! welcome to the bar.`)
)
// listen customer change by action type and predication.
const off2 = store.on(
  'CUSTOMER',
  (prevState, state) => state.customer.age < 18,
  (prevState, state) => alert(`Hey, boy! Can't drink!`)
)
// cancel listen
off()
```

#### once([type], [predicate], handler)

Adds a change handler. It will be called only once an action with specified type dispatched
or successful predication.

###### Arguments
1. `type` (String): The type of action.
2. `predicate` (Function): The predicate logic. It will be called with two parameters: `prevState`, `state`.
3. `handler` (Function): The change handler. It will be called with two parameters: `prevState`, `state`.

###### Returns
(Function): A function that drop the change handler.

###### Examples
```js
store.once('CUSTOMER', (prevState, state) => {
  alert(`Hey, you are the first customer, free drinking tonight!`)
})
```

## License

MIT
