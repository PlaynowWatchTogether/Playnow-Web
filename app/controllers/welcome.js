import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import Ember from "ember"
export default Controller.extend({
  firebaseApp: service(),
  init() {
    this._super(...arguments);

    this.form = this.form || {
      username: '',
      password: ''
    };
    this.error = ''

  },
  async loginWithEmail(email, password) {
    const auth = await this.get('firebaseApp').auth();
    auth.signInWithEmailAndPassword(email, password).then(() => {
      Ember.Logger.debug('signed in');
      this.transitionToRoute("home");
    }).catch((error) => {
      Ember.Logger.debug(error)
      this.set('error', "Login failed")
    })
  },
  actions: {
    async loginAction() {
      this.set('error', "");
      const db = await this.get('firebaseApp').database();
      let username = this.form.username;
      let password = this.form.password;
      if (username.includes("@")) {
        this.loginWithEmail(username, password)
      } else {
        db.ref('UserIndex').orderByChild('Username').equalTo(username).once('value', (snapshot) => {
          let userEmail = username + "@g2z4oldenfingers.com";
          let emails = [];
          snapshot.forEach((item) => {
            emails.push(item.child("Email").val())
          });
          if (emails.length > 0) {
            userEmail = emails[0] ? emails[0] : ''
          }
          this.loginWithEmail(userEmail, password)
        }, (error) => {
          Ember.Logger.debug(error)
          this.set('error', "Login failed")
        });
        Ember.Logger.debug('w/o @')
      }

    }
  }
});
