import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import moment from "moment";
import {computed} from "@ember/object";
import {set} from "@ember/object";
import {debug} from "@ember/debug";

export default Controller.extend({
  auth: service(),
  db: service(),
  firebaseApp: service(),
  init() {
    this._super(...arguments);
    this.set('isDisabled', true);
    this.addObserver('model', this, 'modelObserver');
  },
  modelObserver(obj) {
    let m = obj.get('model');
    if (!m)
      return;
    let form = {};
    let email = m['Email'];
    form.username = m['Username'];
    if (email && email.includes('@g2z4oldenfingers.com')) {
      form.username = email.split("@")[0];
    }
    form.email = m['ActualEmail'] || m['Email'];
    form.firstName = m['FirstName'];
    form.lastName = m['LastName'];
    form.birthDay = moment(m['BirthDate']);
    form.ProfilePic = m['ProfilePic'];
    obj.set('form', form);
  },
  date: computed('form', {
    get() {
      let m = this.get('form');
      if (!m)
        return moment().toDate();
      return this.get('form.birthDay').toDate();
    },
    set(i, date) {
      this.set('form.birthDay', moment(date));
      return date;
    }
  }),

  profilePic: computed('form.ProfilePic', function () {
    let m = this.get('form');
    if (!m || !m['ProfilePic'] || m['ProfilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['ProfilePic'] || '/assets/monalisa.png'
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
  hasNewRequests: computed('followers.@each', function () {
    return (this.get('followers') || []).length > 0;
  }),
  actions: {
    onBirthdayDateSet(bd) {
      this.set('form.birthDay', bd);
    },

    triggerSearch() {
      let q = this.get('searchQuery');
      if (q.length !== 0) {
        this.transitionToRoute('search', {query: q});
      }
    },
    logout() {
      this.get('auth').logout();
    },
    followerAction(action, model) {
      if (action === 1) {
        //confirm
        this.get('db').confirmRequest(model);
      } else {
        //cancel
        this.get('db').cancelRequest(model);
      }
    },
    uploadImage(file) {
      file.readAsDataURL().then((url) => {
        let ref = this.firebaseApp.storage().ref('Media/ProfilePic/' + this.get('firebaseApp').auth().currentUser.uid + "/" + this.generateUUID() + '.png');

        ref.putString(url, 'data_url').then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            let form = this.get('form');
            set(form, 'ProfilePic', downloadURL);
            this.set('form', form);
            this.get('db').updateProfilePic(downloadURL);
            debug('File available at', downloadURL);
          });
        });
      });
    },
    updateProfile() {
      let form = this.get('form');
      if (form.firstName.length !== 0 &&
        form.lastName.length !== 0) {
        this.get('db').updateProfile(form.firstName, form.lastName, form.birthDay.format("YYYY-MM-DD"), form.email)
      }
      this.set('isDisabled', true);
    },
    edit() {
      this.set('isDisabled', false);
    },
    cancelUpdate() {
      let m = this.get('model');
      if (!m)
        return;
      let form = {};
      let email = m['Email'];
      form.username = m['Username'];
      if (email && email.includes('@g2z4oldenfingers.com')) {
        form.username = email.split("@")[0];
      }
      form.email = m['ActualEmail'] || m['Email'];
      form.firstName = m['FirstName'];
      form.lastName = m['LastName'];
      form.birthDay = moment(m['BirthDate']);
      form.ProfilePic = m['ProfilePic'];
      this.set('form', form);

      this.set('isDisabled', true);
    }
  }
});
