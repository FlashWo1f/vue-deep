// 数组响应式
// 1. 替换数组原型中的7个能改变源数组的方法
const originalProtp = Array.prototype
const arrayProto = Object.create(originalProtp)
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  arrayProto[method] = function () {
    originalProtp[method].apply(this, arguments)
    console.log('被拦截', this)
  }
})

function defineReactive(obj, key, val) {

  observe(val)

  const deps = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      // console.log('get', key)
      // 依赖收集建立
      Dep.target && deps.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        // console.log('set', key)
        // 防止用户将值设置为对象
        observe(newVal)
        val = newVal
        // 通知更新
        deps.notify()
      } 
    }
  })
}

// 遍历传入 obj 的所有属性，执行响应式处理
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return
  }
  new Observer(obj)
}

// Vue.$set
function set(obj, key, val) {
  defineReactive(obj, key, val)
}

function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(newVal) {
        vm.$data[key] = newVal
        return true
      }
    })
  })
}

class Observer {
  constructor(obj) {
    // 判断传入obj类型，做相应处理
    if (Array.isArray(obj)) {
      this.walkArray(obj)
    } else {
      this.walk(obj);
    }
  }

  walk(obj) {
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]))
  }

  walkArray(obj) {
    obj.__proto__ = arrayProto
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i])
    }
  }
}

class KVue {
  constructor(options) {
    // 0. 保存选项
    this.$options = options
    this.$data = options.data
    // 1. 响应式
    observe(this.$data)
    proxy(this)
    // 1.5 将数据代理到 this
    // 2. 编译模板
    new Compile(options.el, this)
  }
}

class Compile {
  constructor(el, vm) {
    // 保存实例
    this.$vm = vm

    // 获取宿主元素 dom
    const _el = document.querySelector(el)

    // 编译他
    this.compile(_el)
  }

  compile(el) {
    const childNodes = el.childNodes
    childNodes.forEach(node => {
      if (this.isElement(node)) {
        this.compileElement(node)        
        if (node.childNodes.length > 0) {
          this.compile(node)
        }
      } else if (this.isInter(node)) {
        // 插值绑定表达式
        // console.log('编译插值', node.textContent)
        this.compileText(node)
      }
    })
  }

  // 统一调配更新
  // 处理所有动态绑定 dir => 指令名
  update(node, exp, dir) {
    // 1. 初始化
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])
    // 2. 创建 Watcher 实例，负责后续更新
    new Watcher(this.$vm, exp, (val) => {
      fn && fn(node, val)
    })
  }

  // k-text
  text(node, exp) {
    this.update(node, exp, 'text')
    // node.textContent = this.$vm[exp]
  }

  textUpdater(node, val) {
    node.textContent = val
  }

  // k-model = value + update:value
  model(node, exp) {
    // update 方法只完成赋值和更新，不负责事件监听
    this.update(node, exp, 'model')
    // 手动添加事件监听
    node.addEventListener('input', e => {
      this.$vm[exp] = e.target.value
    })
  }

  modelUpdater(node, val) {
    // 表单元素赋值 不考虑少数情况 （不为 value）
    node.value = val
  }

  compileElement(node) {
    // 元素: 解析动态的指令、属性绑定、事件
    // console.log('编译元素', node.nodeName)
    const attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      // 判断是否动态
      // 1. 指令 v-xxx
      const attrName = attr.name
      const exp = attr.value
      if (this.isDir(attrName)) {
        const dir = attrName.substring(2)
        // 是否是合法指令 是则执行处理函数
        this[dir] = this[dir](node, exp)
      }
      // 2. 事件 以 @ 开头
      if (this.isEvent(attrName)) {
        const event = attrName.substring(1)
        // 事件监听
        this.eventHandler(node, exp, event)
      }
    })
  }

  // 解析 {{ oox }}
  compileText(node) {
    this.update(node, (RegExp.$1).trim(), 'text')
    // node.textContent = this.$vm[(RegExp.$1).trim()]
  }

  isElement(node) {
    return node.nodeType === 1
  }
  // {{ val }}
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  isDir(attrName) {
    return attrName.startsWith('k-')
  }

  isEvent(attrName) {
    return attrName.startsWith('@')
  }

  eventHandler(node, exp, event) {
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
    node.addEventListener(event, fn.bind(this.$vm))
    // debugger
  }
}


// 负责具体节点的更新
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater

    // 读当前值，触发依赖收集
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  // Dep
  update() {
    const val = this.vm[this.key]
    this.updater.call(this.vm, val)
  }
}

// Dep 和响应式属性 key 有一一对应关系
// 负责通知 watchers 更新
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }
}
