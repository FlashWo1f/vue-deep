let Vue

class Store {
  constructor(options) {
    this.$options = options

    this._mutations = options.mutations
    this._actions = options.actions
    this._wrappedGetters = options.getters
    const computed = {}
    this.getters = {}
    
    const store = this
    Object.keys(this._wrappedGetters).forEach(key => {
      // 获取用户定义的 getter
      const fn = store._wrappedGetters[key]
      // 转换为 computed 可以使用无参数形式
      computed[key] = function () {
        return fn(store.state)
      }
      // 为 getters 定义只读属性
      Object.defineProperty(store.getters, key, {
        get() {
          return store._vm[key]
        }
      })
    })


    this._vm = new Vue({
      data() {
        return {
          $$state: options.state 
        }
      },
      computed,
    })

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