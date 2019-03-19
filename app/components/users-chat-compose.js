import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

import Ember from 'ember'

export default Component.extend({
  firebaseApp: service(),
  db: service(),
  init() {
    this._super(...arguments);
    this.chips = [];
  },
  hasChips: computed('chips.@each', function () {
    return this.get('chips').length > 0;
  }),
  didInsertElement() {
    this._super(...arguments);
    let uid = this.firebaseApp.auth().currentUser.uid;
    let ref = this.firebaseApp.database().ref('Users/' + uid + "/Friends");
    ref.on('value', (data) => {
      let records = [];
      data.forEach((elem) => {
        let payload = elem.val();
        payload['id'] = elem.key;
        let profilePic = '';
        if (!payload['profilePic'] || payload['profilePic'].length === 0) {
          profilePic = '/assets/monalisa.png'
        } else {
          profilePic = payload['profilePic']
        }
        payload['profilePic'] = profilePic;
        records.push(payload);
      });
      this.set('friends', records)
    })
  },
  suggestionTemplate: function (data) {
    let profilePic = '';
    if (!data['profilePic'] || data['profilePic'].length === 0) {
      profilePic = '/assets/monalisa.png'
    } else {
      profilePic = data['profilePic']
    }
    return '<div class="suggestion-item">' + '<div class="profilePicWrapper"><img class="profilePic" src="' + profilePic + '"></div> <div class="name">' + data['firstName'] + ' ' + data['lastName'] + '</div></div>'
  },
  actions: {
    updateTerm(term) {
      this.set('results', this.get('friends'));
      console.log('term updated to ' + term);
    },
    selectFriend(result) {
      $('#typeahead-compose').val('');
      this.get('onChipAdd')(result);
    },
    onChipClick(chip) {
      this.get('onChipClick')(chip);
    }
  }
});
