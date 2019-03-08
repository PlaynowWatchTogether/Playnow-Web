<template>
  <div id="app">
      <div class="logo-block">
      <span class="logo-text">Playnow</span>
      <img class="logo" src="@/assets/logo.png">
    </div>
    <div class="login-block">
      <span class="login-label"> Username or email </span>
      <span class="login-label"> Password </span>
      <v-layout row wrap>
        <v-flex xs12 sm6 md4>
          <v-text-field
              solo
            ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md4>
          <v-text-field
              solo
            ></v-text-field>
        </v-flex>
        <v-btn round color="#71C3FF" class="white--text">Login</v-btn>
      </v-layout> 
    </div>
    <div class="content">
      <div class="phone-background">
        <div class="download-content">
          <img class="phone" src="@/assets/phone.png">
          <div class="download-text">
            <span>Watch Together!</span>
            <br>
            <span>Anywhere!</span>
            <br>
            <p class="small-text">Get the app.</p>
            <img class="app-store" src="@/assets/app-store.png">
          </div>
        </div>
      </div>
      <div class="registration-background">
        <div class="registration-block">
          <p class="registration-header"> Create a New Account </p>
          <p> Text and watch together! </p>
            <v-layout row wrap>
              <v-flex xs12 sm6 md6>
                <v-text-field
                    label="Solo"
                    placeholder="First Name"
                    solo-inverted
                  ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md6>
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
              placeholder="New password"
              solo-inverted
            ></v-text-field>

          <p> Birthday </p>
          <v-layout row wrap>
            <v-flex xs12 sm6 md2>
              <v-text-field
                  placeholder="Feb"
                  solo-inverted
                ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md2>
              <v-text-field
                  placeholder="12"
                  solo-inverted
                ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md3>
              <v-text-field
                  placeholder="2019"
                  solo-inverted
                ></v-text-field>
            </v-flex>
          </v-layout>
        <p> By clicking Sign Up, you agree to the Terms and Policy.</p>
        <v-btn large round color="#71C3FF" class="white--text" href="main.html">Sign Up</v-btn>

        </div>
      </div>
    </div>
    <div class="footer-content">
      <v-layout row xs12 wrap>
          <v-layout column>
            <p class="footer-headline">Company</p>
            <p class="footer-text"> About Playnow </p>
            <p class="footer-text"> Jobs </p>
          </v-layout>
          <v-layout column>
            <p class="footer-headline">Legal</p>
            <p class="footer-text"> Terms of Use </p>
            <p class="footer-text"> Privacy Policy </p>
            <p class="footer-text"> Copyright </p>
          </v-layout>
          <v-layout column>
            <p class="footer-headline">Community</p>
            <p class="footer-text"> Guidelines </p>
            <p class="footer-text"> Support </p>
          </v-layout>
          <v-layout column>
            <p class="footer-headline">Business</p>
            <p class="footer-text"> Branding</p>
            <p class="footer-text"> Contact </p>
          </v-layout>
      </v-layout>
    </div>
    <footer>
    <p class="copyright-text">©2019 Playnow, Inc. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  methods: {
  },
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
}
.theme--light.v-text-field--solo.v-text-field--solo>.v-input__control>.v-input__slot {
  border-radius: 500px;
}
.v-text-field.v-text-field--solo .v-input__control {
  min-height: 0px;
  margin-right: 6px;
}
.logo-text {
  font-size: 38px;
  color: white;
  float: left;
  font-weight: bold;
}
.logo {
  height: 53px;
  float: left;
  padding-left: 1rem;
}
.logo-block {
  padding-left: 10rem;
  padding-top: 1rem;
  padding-bottom: 2rem;
  display: inline-block;
}
.content {
  display: block;
  position: relative;
}
.download-content {
  padding-left: 10rem;
  font-size: 28px;
  font-weight: 1000;
  display: inline-block;
}
.phone {
  height: 319px;
  position: relative;
  display: inline-block;
  top: 8rem;
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
  position: sticky;
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
  max-width: 500px;
}
.registration-header {
  font-size: 30px;
}
.login-block {
  float: right;
  max-width: 500px;
}
.footer-content {
  display: inline-block;
  padding: 2rem 0rem 0rem 5rem;
  color: white;
  font-size: 20px;
}
.footer-text {
  padding: 0rem 4rem 1rem 1rem;
}
.footer-headline {
  padding: 0rem 4rem 2rem 1rem;
  font-size: 1.17em;
  font-weight: bold;
}
.login-label {
  margin: 2rem;
  color: white;
}
.copyright-text {
  color: white;
  float: right;
  padding: 2rem 5rem 2rem 2rem;
}
</style>