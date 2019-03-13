import Controller from '@ember/controller';
import {computed} from "@ember/object";
import moment from 'moment'
import {inject as service} from '@ember/service';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
  },
  modelObserver(obj) {
    let m = obj.get('model');
    let form = {};
    let email = m['Email'];
    form.username = m['Username'];
    if (email.includes('@g2z4oldenfingers.com')) {
      form.username = email.split("@")[0];
    } else {
      form.email = m['Email'];
    }
    form.firstName = m['FirstName'];
    form.lastName = m['LastName'];
    form.birthDay = moment(m['BirthDate']);
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
  profilePic: computed('model', function () {
    let m = this.get('model');
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
  actions: {
    updateProfile() {
      let form = this.get('form');
      if (form.firstName.length !== 0 &&
        form.lastName.length !== 0) {
        this.get('db').updateProfile(form.firstName, form.lastName, form.birthDay.format("YYYY-MM-DD"))
      }
    }
  }
});
