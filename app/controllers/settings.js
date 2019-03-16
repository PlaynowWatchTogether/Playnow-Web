import Controller from '@ember/controller';
import {computed} from "@ember/object";
import moment from 'moment'
import {inject as service} from '@ember/service';
import Ember from 'ember';

export default Controller.extend({
  db: service(),
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
  },
  modelObserver(obj) {
    let m = obj.get('model');
    let form = {};
    let email = m['Email'];
    form.username = m['Username'];
    if (email && email.includes('@g2z4oldenfingers.com')) {
      form.username = email.split("@")[0];
    } else {
      form.email = m['Email'];
    }
    form.firstName = m['FirstName'];
    form.lastName = m['LastName'];
    form.birthDay = moment(m['BirthDate']);
    form.ProfilePic = m['ProfilePic'];
    obj.set('form', form);
  },
  date: computed('form', {
    get() {
      return this.get('form.birthDay').toDate();
    },
    set(i, date) {
      this.set('form.birthDay', moment(date));
      return date;
    }
  }),
  profilePic: computed('form.ProfilePic', function () {
    let m = this.get('form');
    if (!m['ProfilePic'] || m['ProfilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['ProfilePic']
    }
  }),
  username: computed('model', function () {
    let m = this.get('model');
    return m['Username'];
  }),
  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  actions: {
    uploadImage(file) {
      file.readAsDataURL().then((url) => {
        let ref = this.firebaseApp.storage().ref('Media/ProfilePic/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + '.png');

        ref.putString(url, 'data_url').then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            let form = this.get('form');
            Ember.set(form, 'ProfilePic', downloadURL);
            this.set('form', form);
            this.get('db').updateProfilePic(downloadURL);
            console.log('File available at', downloadURL);
          });
        });
      });
    },
    updateProfile() {
      let form = this.get('form');
      if (form.firstName.length !== 0 &&
        form.lastName.length !== 0) {
        this.get('db').updateProfile(form.firstName, form.lastName, form.birthDay.format("YYYY-MM-DD"))
      }
    }
  }
});
