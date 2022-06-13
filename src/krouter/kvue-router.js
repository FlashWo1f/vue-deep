let Vue

class KVueRouter {
  constructor(options) {
    this.$options = options

    // current 必须是响应式的？如何做到？
    // Vue.set 是不可以的 因为他需要对象本身是一个响应式对象
    Vue.util.defineReactive(this, 'current', window.location.hash.slice(1) || '/')
    // this.current = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'matched', [])
    this.match()
    window.addEventListener('hashchange', () => {
      this.current =  window.location.hash.slice(1)
      this.matched = []
      this.match()
    })

  }

  match(routes) {
    routes = routes || this.$options.routes

    // 递归遍历路由表
    for (const route of routes) {
      if (route.path === '/' && this.current === '/') {
        this.matched.push(route)
        return
      }

      // 
      if (route.path !== '/' && this.current.includes(route.path)) {
        this.matched.push(route)
        if (route.children) {
          this.match(route.children)
        }
        return
      }
    }
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
      // 标记当前 router-view 深度
      this.$vnode.data.routerView = true

      let depth = 0
      let parent = this.$parent
      while(parent) {
        const vnodeData = parent.$vnode && parent.$vnode.data
        if (vnodeData) {
          if (vnodeData.routerView) {
            depth++
          }
        }

        parent = parent.$parent
      }

      let component = null
      const route = this.$router.matched[depth]
      if (route) {
        component = route.component
      }
      return h(component)
    }
  })
}

export default KVueRouter