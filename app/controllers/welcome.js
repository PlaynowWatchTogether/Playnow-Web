import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import moment from "moment";
import {debug} from '@ember/debug';
import {computed} from '@ember/object';
import {Promise} from 'rsvp';
export default Controller.extend({
  firebaseApp: service(),
  init() {
    this._super(...arguments);

    this.form = this.form || {
      username: '',
      password: '',
      register: {
        birthDate: moment().subtract(13, 'years'),
        error: {}
      }
    };
    this.error = ''

  },
  signupBtnClass: computed('signupLoading', function () {
    return this.get('signupLoading') ? 'active' : '';
  }),
  loginBtnClass: computed('loginLoading', function () {
    return this.get('loginLoading') ? 'active' : '';
  }),
  userCreated() {
    this.set('signupLoading', false);
    const auth = this.get('firebaseApp').auth();
    debug("Created user with " + auth.currentUser.uid);
    this.transitionToRoute("home");
  },
  async loginWithEmail(email, password) {
    const auth = await this.get('firebaseApp').auth();
    auth.signInWithEmailAndPassword(email, password).then(() => {
      debug('signed in');
      this.userCreated();
      this.set('loginLoading', false);
    }).catch((error) => {
      debug(error);
      this.set('loginLoading', false);
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
    return moment().diff(birthday, 'years');
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
      this.set('signupLoading', false);
      this.set('form.register.error', {});
      this.set('error', '');
    }, 2000);

  },
  actions: {
    forgotAction() {
      this.set('forgotBtnClass', 'active');
      let email = this.get('forgotEmail');
      if (!email || email.length === 0) {
        this.set('forgotBtnClass', '');
        this.set('forgotError', 'Email should not be empty');
        setTimeout(() => {
          this.set('forgotError', '');
        }, 2000);
      } else {
        this.get('firebaseApp').auth().sendPasswordResetEmail(email).then(() => {
          this.set('forgotBtnClass', '');
          this.set('forgotEmail', '');
          this.set('showForgot', false);
        }).catch(() => {
          this.set('forgotBtnClass', '');
          this.set('forgotError', 'Failed to send reset password');
          setTimeout(() => {
            this.set('forgotError', '');
          }, 2000);
        });
      }
    },
    openForgot() {
      this.set('showForgot', true);
    },
    forgotCancel() {
      this.set('showForgot', false);
    },
    onDateSet(dateMoment) {
      this.set('form.register.birthDate', dateMoment);
    },
    async signUpAction() {
      this.set('signupLoading', true);
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
        debug("User found: " + ret);
        if (ret === 0) {
          this.set('form.register.error.username', 'Username already taken');
          this.clearError();
        } else {
          this.createUser(register.username, register.password).then((user) => {
            let bd = register.birthDate.format("YYYY-MM-DD");
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
            }, () => {
              this.userCreated()
            })
          }, (error) => {
            if (error.code === 'auth/weak-password') {
              this.set('form.register.error.password', error.message);
            } else {

              this.set('form.register.error.global', 'Sign up failed');
              this.clearError();
            }
          })
        }
      }, (error) => {
        debug(error);
      });
    },
    async loginAction() {
      this.set('loginLoading', true);
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
          debug(error);
          this.set('loginLoading', false);
          this.set('error', "Login failed");
          this.clearError();
        });
        debug('w/o @')
      }

    }
  }
});
