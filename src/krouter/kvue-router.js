
let Vue

class KVueRouter {
  constructor() {
    console.log('@@', Vue)
  }
}

KVueRouter.install = (_V) => {
  Vue = _V
  // 声明两个全局组件: router-link/router-view
  Vue.component('router-link', {
    // template: '<a>router-link</a>'
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
    // template: '<div>router-view</div>'
    render(h) {
      return h('div', 'router-view')
    }
  })
}

export default KVueRouter