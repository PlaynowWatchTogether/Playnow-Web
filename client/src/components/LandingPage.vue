<template>
  <div>
    <div class="logo-block">
      <span class="logo-text">Playnow</span>
      <img class="logo" src="../assets/logo.png">
    </div>
    <div class="content">
      <div class="phone-background">
        <img class="phone" src="../assets/phone.png">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logo-text {
  font-family: "Avenir Next";
  font-size: 38px;
  color: white;
  float: left;
}

.logo {
  width: 53px;
  height: 53px;
  float: left;
  padding-left: 1rem;
}

.logo-block {
  padding-left: 2.5rem;
  display: inline-block;
}

.content {
  display: block;
  position: relative;
}

.phone {
  width: 240px;
  height: 319px;
  position: relative;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.phone-background {
  background: white;
  width: 55%;
  height: 600px;
  z-index: 1;
  border-top-right-radius: 5%;
  border-bottom-right-radius: 5%;
  
}

</style>
