let Vue

class Store {
  constructor(options) {
    this.$options = options

    this._vm = new Vue({
      data() {
        return {
          $$state: options.state 
        }
      }
    })

    this._mutations = options.mutations
    this._actions = options.actions
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  commit(type, payload) {
    const mutation = this._mutations[type]
    if (!mutation) {
      console.error('错误的mutation')
    }
    mutation(this.state, payload)
  }

  dispatch(type, payload) {
    const actions = this._actions[type]
    if (!actions) {
      console.error('错误的actions')
    }
    // 这里可以判断执行结果是否为 Promise, 如果不是就用 Promise 包装一下
    actions(this, payload)
  }

  get state() {
    return this._vm._data.$$state
  }
  set state(val) {
    console.warn('不要手动设置 state')
  }
}

function install(_V) {
  Vue = _V

  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install,
}