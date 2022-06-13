<template>
  <div class="home">
    <h1>Home Page</h1>
    <p @click="$store.commit('add')">
      {{ $store.state.counter }}
    </p>
    <p @click="$store.dispatch('add')">
      async: {{ $store.state.counter }}
    </p>
    <!-- <p>
      doubleCounter: {{ $store.getters.doubleCounter }}
    </p> -->
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script>
