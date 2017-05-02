/**
 * Created by toplan on 17/4/28.
 */
import { assert } from 'chai';
import { createStore } from 'redux'
import addOnAndOnceToStore from '../src/index'

const SET_USER = 'SET_USER'
const INC_ID = 'INC_ID'
const reducer = (prevState, action) => {
  if (!action || !action.type) return prevState
  if (action.type === SET_USER) return { ...prevState, user: action.payload }
  if (action.type === INC_ID) return { ...prevState, id: ++prevState.id }
  return prevState
}
const initState = {
  id: 0,
  user: null
}

describe('redux-on enhancer', () => {
  it('throws if create enhancer with invalid option `getActionType`', () => {
    assert.throws(() => addOnAndOnceToStore({ getActionType: null }), TypeError)
  })

  const enhancer = addOnAndOnceToStore()

  it('must return a function as store enhancer', () => {
    assert.isFunction(enhancer)
    assert.strictEqual(enhancer.length, 1)
  })

  describe('enhance store', () => {
    const store = createStore(reducer, initState, enhancer)

    it('must return a store with methods `on` and `once`', () => {
      assert.isObject(store)
      assert.isFunction(store.getState)
      assert.isFunction(store.subscribe)
      assert.isFunction(store.dispatch)
      assert.isFunction(store.on)
      assert.isFunction(store.once)
    })

    describe('listen change', () => {
      const user = { name: 'top lan', age: 20 }
      const user1 = { name: 'top lan 1', age: 21 }
      const user2 = { name: 'top lan 2', age: 22 }

      it('throws if listen change without `predicate`', () => {
        assert.throws(() => store.on(), TypeError)
        assert.throws(() => store.on(null, () => {}), TypeError)
        assert.throws(() => store.on(null, null, () => {}), TypeError)
      })

      it('throws if listen change without `handler`', () => {
        assert.throws(() => store.on(() => {}), TypeError)
        assert.throws(() => store.on(SET_USER, () => {}, 1), TypeError)
      })

      describe('any time by predicate', () => {
        const store = createStore(reducer, initState, enhancer)
        let triggerCount = 0
        let currentUser = store.getState().user
        const off = store.on((prevState, state) => {
          return prevState.user !== state.user
        }, (prevState, state) => {
          triggerCount++
          currentUser = state.user
        })

        it('must return a function for drop listener', () => {
          assert.isFunction(off)
        })

        it('must handle once if dispatch once', () => {
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })

        it('must handle 3 times after more dispatches', () => {
          store.dispatch({ type: SET_USER, payload: user1 })
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user2 })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 3)
          assert.strictEqual(currentUser, user2)
        })

        it('must not handle change if drop listener', () => {
          off()
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: SET_USER, payload: user1 })
          assert.strictEqual(triggerCount, 3)
          assert.strictEqual(currentUser, user2)
        })
      })

      describe('any time by action type', () => {
        const store = createStore(reducer, initState, enhancer)
        let triggerCount = 0
        let currentUser = store.getState().user
        const off = store.on(SET_USER, (prevState, state) => {
          triggerCount++
          currentUser = state.user
        })

        it('must return a function for drop listener', () => {
          assert.isFunction(off)
        })

        it('must handle once if dispatch once', () => {
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })

        it('must handle 3 times after more dispatches', () => {
          store.dispatch({ type: SET_USER, payload: user1 })
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user2 })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 3)
          assert.strictEqual(currentUser, user2)
        })

        it('must not handle change if drop listener', () => {
          off()
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: SET_USER, payload: user1 })
          assert.strictEqual(triggerCount, 3)
          assert.strictEqual(currentUser, user2)
        })
      })

      describe('any time by action type and predicate', () => {
        const store = createStore(reducer, initState, enhancer)
        let triggerCount = 0
        let currentUser = store.getState().user
        const off = store.on(
          SET_USER,
          (prevState, state) => state.user.age <= 21,
          (prevState, state) => {
            triggerCount++
            currentUser = state.user
          }
        )

        it('must return a function for drop listener', () => {
          assert.isFunction(off)
        })

        it('must handle once if dispatch a user who age is 20', () => {
          store.dispatch({ type: SET_USER, payload: user })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })

        it('must not handle if dispatch a user who age is 22', () => {
          store.dispatch({ type: SET_USER, payload: user2 })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })

        it('must handle 3 times after more dispatches', () => {
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user1 })
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: SET_USER, payload: user2 })
          assert.strictEqual(triggerCount, 3)
          assert.strictEqual(currentUser, user)
        })
      })

      describe('only once by predicate', () => {
        const store = createStore(reducer, initState, enhancer)
        let triggerCount = 0
        let currentUser = store.getState().user
        const off = store.once((prevState, state) => {
          return prevState.user !== state.user
        }, (prevState, state) => {
          triggerCount++
          currentUser = state.user
        })

        it('must return a function for drop listener', () => {
          assert.isFunction(off)
        })

        it('must handle once if dispatch once', () => {
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })

        it('must handle once after more dispatches', () => {
          store.dispatch({ type: SET_USER, payload: user1 })
          store.dispatch({ type: INC_ID })
          store.dispatch({ type: SET_USER, payload: user2 })
          store.dispatch({ type: INC_ID })
          assert.strictEqual(triggerCount, 1)
          assert.strictEqual(currentUser, user)
        })
      })
    })
  })
})