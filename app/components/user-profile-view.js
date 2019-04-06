import {get} from '@ember/object';
import Component from '@ember/component';
import $ from 'jquery';
import {debug} from '@ember/debug';
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
    if (profile['id'] !== this.db.myId()) {
      profileModal.find('.profilePicChange input').attr('disabled', 'true');
    } else {
      let offClb = this.db.profileObserver(this.db.myId(), (profile) => {
        let pictured = PicturedObject.create({content: profile});
        profileModal.find('.profilePic').attr('src', pictured.get('profilePic'));
      });
      profileModal.on('hidden.bs.modal', () => {
        this.db.offProfileObserver(this.db.myId(), offClb);
        debug('Profile modal hidden')
      });
      profileModal.find('.profilePicChange input').attr('disabled', null);

    }
    let friends = Object.keys(get(profile, 'Friends') || {});
    let followers = Object.keys(get(profile, 'Followers') || {});
    if (profile['id'] === this.db.myId()) {
      profileModal.find('.add-holder').hide();
      profileModal.find('.added-holder').hide();
    } else if (friends.includes(this.db.myId()) || followers.includes(this.db.myId())) {
      if (friends.includes(this.db.myId())) {
        profileModal.find('.added-holder .label')[0].innerText = 'Friends';
      } else {
        profileModal.find('.added-holder .label')[0].innerText = 'Added';

      }
      profileModal.find('.add-holder').hide();
      profileModal.find('.added-holder').show();
    } else {
      let addHolder = profileModal.find('.add-holder');
      addHolder.show();
      addHolder.attr('data-user-id', profile['id']);
      addHolder.on('click', () => {
        if (this.get('onRequestSent')) {
          this.get('onRequestSent')(profile);
        } else {
          this.db.followUser(addHolder.attr('data-user-id'));

        }
        addHolder.hide();
        profileModal.find('.added-holder').show();
      });
      profileModal.find('.added-holder').hide();
    }
    profileModal.find('.friends .number')[0].innerText = friends.length;

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
