import Component from '@ember/component';
import {computed} from '@ember/object'
import {inject as service} from '@ember/service';

export default Component.extend({
  db: service(),
  didInsertElement() {
    this._super(...arguments);
    this.db.profile(this.get('model').id).then((profile) => {
      let followers = Object.keys(profile['Followers'] || {});
      let friends = Object.keys(profile['Friends'] || {});
      if (followers.includes(this.db.myId())) {
        this.set('added', true);
        this.set('addedTitle', 'Added');
      }
      if (friends.includes(this.db.myId())) {
        this.set('added', true);
        this.set('addedTitle', 'Friends');
      }


    });
  },
  displayName: computed('model', function () {
    let email = this.get('model.Email');
    if (email && email.includes('@')) {
      return email.split('@')[0]
    }
    return email;
  }),
  isAdded: computed('model', 'sent', 'added', function () {
    let res = false;
    let model = this.get('model');
    this.get('sent').forEach((elem) => {
      if (elem.id === model.id) {
        res = true
      }
    });
    return res || this.get('added');
  }),
  actions: {
    addFriend() {
      this.addAction(this.get('model'));
      this.notifyPropertyChange('sent');
    },
    onRequestSent(profile) {
      this.addAction(profile);
      this.notifyPropertyChange('sent');
    }
  }
});
