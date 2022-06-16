function defineReactive(obj, key, val) {

  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set', key)
        val = newVal
      } 
    }
  })
}

// 遍历传入 obj 的所有属性，执行响应式处理
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

// Vue.$set
function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = {
  foo: 'foo',
  bar: 'bar',
  baz: {
    a: 1
  }
}

observe(obj)

obj.foo = 'foooo'
obj.bar = 'barrrr'

// 2. 数组支持不了
// 需要拦截数组的7个变更方案，在数组操作的同事，进行变更通知