<template>
  <div>
    <div class="logo-block">
      <span class="logo-text">Playnow</span>
      <img class="logo" src="../assets/logo.png">
    </div>
    <div class="content">
      <div class="phone-background">
        <div class="download-content">
          <img class="phone" src="../assets/phone.png">
          <div class="download-text">
            <span>Watch Together!</span>
            <br>
            <span>Anywhere!</span>
            <br>
            <p class="small-text">Get the app.</p>
            <img class="app-store" src="../assets/app-store.png">
          </div>
        </div>
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
  font-weight: 300;
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

.download-content {
  padding-left: 10rem;
  font-family: "Avenir Next";
  font-size: 28px;
  font-weight: 1000;
  display: inline-block;
}

.phone {
  width: 240px;
  height: 319px;
  position: relative;
  display: inline-block;
  padding-top: 5%;
}

.phone-background {
  background: white;
  width: 55%;
  height: 600px;
  z-index: 1;
  border-top-right-radius: 5%;
  border-bottom-right-radius: 5%;
  
}

.download-text {
  position: relative;
  display: inline-block;
  padding-right: 3rem;
}

.app-store {
  width: 15rem;
}

.small-text {
  font-size: 12px;
  text-align: center;
  font-weight: 100;
}

</style>
