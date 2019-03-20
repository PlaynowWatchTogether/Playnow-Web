import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import Ember from "ember"

export default Controller.extend({
  firebaseApp: service(),
  init() {
    this._super(...arguments);

    this.form = this.form || {
      username: '',
      password: '',
      register: {
        error: {}
      }
    };
    this.error = ''

  },
  userCreated() {
    const auth = this.get('firebaseApp').auth();
    Ember.Logger.debug("Created user with " + auth.currentUser.uid);
    this.transitionToRoute("home");
  },
  async loginWithEmail(email, password) {
    const auth = await this.get('firebaseApp').auth();
    auth.signInWithEmailAndPassword(email, password).then(() => {
      Ember.Logger.debug('signed in');
      this.userCreated()
    }).catch((error) => {
      Ember.Logger.debug(error);
      this.set('error', "Login failed");
      this.clearError();
    })
  },
  findUser(username) {
    return new Promise((resolve, reject) => {
      const db = this.get('firebaseApp').database();
      db.ref('UserIndex').orderByChild('Username').equalTo(username).once('value', (snaphot) => {
        if (snaphot.exists()) {
          resolve(0)
        } else {
          resolve(1)
        }
      }, (error) => {
        reject(error)
      })
    })
  },
  updateProfile(user, fields) {
    const db = this.get('firebaseApp').database();
    return db.ref("Users/" + user.uid).update(fields)
  },
  createUser(username, password) {
    const auth = this.get('firebaseApp').auth();
    return auth.createUserWithEmailAndPassword(username + "@g2z4oldenfingers.com", password)
  },
  isEmpty(str) {
    return (!str || 0 === str.length);
  },
  years(birthday) {
    let ageDifMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  },
  addDefaultFriend() {
    let db = this.get('firebaseApp').database();
    let friendID = 'IZ3cAldc41PsvRnppzngv85utJf2';
    let uid = this.get('firebaseApp').auth().currentUser.uid;
    let updates = {};
    updates[uid + '/Friends/' + friendID + '/id'] = uid;
    updates[friendID + '/Friends/' + uid + '/id'] = friendID;
    return db.ref('/Users').update(updates)
  },
  clearError() {
    setTimeout(() => {
      this.set('form.register.error', {});
      this.set('error', '');
    }, 2000);

  },
  actions: {
    async signUpAction() {
      let register = this.get('form.register');
      this.set('form.register.error', {});
      if (this.isEmpty(register.firstName)) {
        this.set('form.register.error.firstName', 'Should not be empty');
        this.clearError();
        return
      }
      if (this.isEmpty(register.lastName)) {
        this.set('form.register.error.lastName', 'Should not be empty');
        this.clearError();
        return
      }
      if (!register.birthDate) {
        this.set('form.register.error.birthDate', 'Should not be empty');
        this.clearError();
        return
      }
      if (this.years(register.birthDate) < 13) {
        this.set('form.register.error.birthDate', 'Should be 13 years old');
        this.clearError();
        return
      }
      if (!register.password) {
        this.set('form.register.error.password', 'Should not be empty');
        this.clearError();
        return
      }
      if (!register.username) {
        this.set('form.register.error.username', 'Should not be empty');
        this.clearError();
        return
      }
      if (register.username.length < 3) {
        this.set('form.register.error.username', 'Should be at least 3 characters.');
        this.clearError();
        return

      }
      if (register.username.includes('@')) {
        this.set('form.register.error.username', 'Should not contain @ character');
        this.clearError();
        return

      }
      this.findUser(register.username).then((ret) => {
        Ember.Logger.debug("User found: " + ret);
        if (ret === 0) {
          this.set('form.register.error.username', 'Username already taken');
          this.clearError();
        } else {
          this.createUser(register.username, register.password).then((user) => {
            let bd = register.birthDate.getFullYear() + "-" + (register.birthDate.getMonth() + 1) + "-" + register.birthDate.getDate()
            let fields = {
              'Email': register.username + "@g2z4oldenfingers.com",
              'BirthDate': bd,
              'FirstName': register.firstName,
              'LastName': register.lastName,
            };
            user.updateProfile({displayName: register.username}).then(() => {
              return this.updateProfile(user, fields)
            }).then(() => {
              return this.addDefaultFriend();
            }).then(() => {
              this.userCreated();
            }, (error) => {
              this.userCreated()
            })
          }, (error) => {
            // if (error.code === 'auth/weak-password'){
            //   this.set('form.register.error.password', error.message);
            // }else{

            this.set('form.register.error.global', 'Sign up failed');
            this.clearError();
            // }
          })
        }
      }, (error) => {
        Ember.Logger.debug(error);
      });
    },
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
          this.set('error', "Login failed");
          this.clearError();
        });
        Ember.Logger.debug('w/o @')
      }

    }
  }
});
