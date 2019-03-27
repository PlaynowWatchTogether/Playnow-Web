import {get} from '@ember/object';
import Component from '@ember/component';
import $ from 'jquery';
import PicturedObject from '../custom-objects/pictured-object'
import {inject as service} from '@ember/service';

export default Component.extend({
  db: service(),
  displayProfile(profile) {
    let pictured = PicturedObject.create({content: profile});
    let profileModal = $('#profileModal');
    profileModal.find('.profilePic').attr('src', pictured.get('profilePic'));

    let email = get(profile, 'Email');
    profileModal.find('.username')[0].innerText = (email || '').split('@')[0];
    profileModal.find('.name')[0].innerText = get(profile, 'FirstName') + ' ' + get(profile, 'LastName');
    if (Object.keys(get(profile, 'Friends')).includes(this.db.myId()) || profile['id'] === this.db.myId()) {
      profileModal.find('.add-holder').hide();
    } else {
      profileModal.find('.add-holder').hide();
      // profileModal.find('.add-holder').show();
    }
    profileModal.find('.friends .number')[0].innerText = Object.keys(get(profile, 'Friends')).length;

    profileModal.modal();
  },
  click() {

    let model = this.get('model');
    if (typeof model === 'object') {
      this.displayProfile(model)
    } else {
      this.db.profile(model).then((profile) => {
        this.displayProfile(profile);
      })
    }
    return false
  }
});
