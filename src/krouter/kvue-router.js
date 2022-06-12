let Vue

class KVueRouter {
  constructor(options) {
    this.$options = options

    // current 必须是响应式的？如何做到？
    // Vue.set 是不可以的 因为他需要对象本身是一个响应式对象
    Vue.util.defineReactive(this, 'current', window.location.hash.slice(1) || '/')
    // this.current = window.location.hash.slice(1) || '/'
    window.addEventListener('hashchange', () => {
      this.current =  window.location.hash.slice(1)
    })
  }
}

KVueRouter.install = (_V) => {
  Vue = _V
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    }  
  })
  // 声明两个全局组件: router-link/router-view
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      return h('a', {
        attrs: {
          href: "#" + this.to
        },
      },
        this.$slots.default,
      )
    }
  })

  Vue.component('router-view', {
    // render 什么时候会执行
    // init 执行 && 响应式数据变化再次执行
    render(h) {
      let component = null
      const route = this.$router.$options.routes.find(
        route => route.path === this.$router.current
      )
      if (route) {
        component = route.component
      }
      return h(component)
    }
  })
}

export default KVueRouter