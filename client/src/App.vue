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
  font-family: "Avenir Next";
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

p {
  margin: 0px;
}

.theme--light.v-text-field--solo-inverted.v-text-field--solo>.v-input__control>.v-input__slot {
  border-radius: 500px;
  margin: 6px;
}

.theme--light.v-text-field--solo.v-text-field--solo>.v-input__control>.v-input__slot {
  border-radius: 500px;
  margin: 6px;
}

.v-text-field.v-text-field--solo .v-input__control {
  min-height: 0px;
  margin-right: 6px;
}
</style>
