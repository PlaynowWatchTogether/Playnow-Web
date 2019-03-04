<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  background: linear-gradient(0.25turn, #87B7FA, #C837EA);
  background-attachment: fixed;
  height: 100%;
  z-index: 0;
}

body {
  margin: 0px;
}
</style>
