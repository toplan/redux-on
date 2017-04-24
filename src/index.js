export default function () {
  return createStore => (reducer, preloadedState, enhancer) => {
    let actionType
    const store = createStore(reducer, preloadedState, enhancer)

    const dispatch = (action) => {
      actionType = action && action.type
      store.dispatch(action)
    }

    const on = (type, predicate, handler, once = false) => {
      if (typeof type === 'function') {
        handler = predicate
        predicate = type
        type = null
      } else if (type && !handler) {
        handler = predicate
        predicate = null
      }

      if (!type && typeof predicate !== 'function') {
        throw new TypeError('Expected predicate to be a function.')
      }
      if (typeof handler !== 'function') {
        throw new TypeError('Expected handler to be a function.')
      }

      let emitted = false
      let prevState = store.getState()
      const emitable = (state) => {
        if (!type) {
          return predicate.call(null, prevState, state)
        }
        if (type !== actionType) return false
        if (predicate !== 'function') return true
        return predicate.call(null, prevState, state)
      }
      const off = store.subscribe(() => {
        const state = store.getState()
        if (emitable(state)) {
          const prevStateSnapshot = prevState
          if (once) {
            if (emitted) return
            off && off()
          }
          emitted = true
          prevState = state
          handler.call(null, prevStateSnapshot, state)
        } else {
          prevState = state
        }
      })

      return off
    }

    const once = (type, predicate, handler) => on(type, predicate, handler, true)

    return {
      ...store,
      dispatch,
      once,
      on,
    }
  }
}
