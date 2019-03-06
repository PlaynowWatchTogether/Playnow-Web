<template>
  <div>
    <div class="logo-block">
      <span class="logo-text">Playnow</span>
      <img class="logo" src="../assets/logo.png">
    </div>
    <div class="login-block">
      <v-layout row wrap>
        <v-flex xs12 sm6 md3>
          <v-text-field
              label="Solo"
              placeholder="First Name"
              solo
            ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-text-field
              label="Solo"
              placeholder="Last Name"
              solo
            ></v-text-field>
        </v-flex>
        <v-btn round color="#71C3FF" class="white--text">Login</v-btn>
      </v-layout> 
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
      <div class="registration-background">
        <div class="registration-block">
          <p class="registration-header"> Create a New Account </p>
          <p> Text and watch together! </p>
            <v-layout row wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field
                    label="Solo"
                    placeholder="First Name"
                    solo-inverted
                  ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field
                    label="Solo"
                    placeholder="Last Name"
                    solo-inverted
                  ></v-text-field>
              </v-flex>
            </v-layout>  
            <p> Add friends with your username! </p>
            <v-text-field
              label="Solo"
              placeholder="Pick a Username (e.g user123)"
              solo-inverted
            ></v-text-field>
            <v-spacer> </v-spacer>
            <v-text-field
              label="Solo"
              placeholder="New password"
              solo-inverted
            ></v-text-field>
            <p> Birthday </p>

          <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="date"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="date"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.menu.save(date)">OK</v-btn>
          </v-date-picker>
        </v-menu>

        <p> By clicking Sign Up, you agree to the Terms and Policy.</p>
        <v-btn large round color="#71C3FF" class="white--text">Sign Up</v-btn>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data: () => ({
    date: new Date().toISOString().substr(0, 10),
    menu: false,
    modal: false,
    menu2: false
  })
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
  height: 53px;
  float: left;
  padding-left: 1rem;
}

.logo-block {
  padding-left: 10rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
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
  border-top-right-radius: 2.5%;
  border-bottom-right-radius: 2.5%;
  float: left;
}

.registration-background {
  background: white;
  z-index: 1;
  width: 40%;
  float: right;
  height: 600px;
  border-top-left-radius: 2.5%;
  border-bottom-left-radius: 2.5%;
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

.registration-block {
  padding-left: 4rem;
  padding-top: 3rem;
  padding-right: 2rem;
}

.registration-header {
  font-family: "Avenir Next";
  font-size: 30px;
}

.login-block {
  float: right;
  max-width: 500px;
  padding-top: 1rem;
}

.footer-information {
  display: inline-block;
}

</style>
