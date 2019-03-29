import DS from 'ember-data';
import {computed} from '@ember/object';

const {attr} = DS;
export default DS.Model.extend({
  profilePic: attr('string'),
  Username: attr('string'),
  Email: attr('string'),
  firstName: attr('string'),
  lastName: attr('string'),
  videoIsPlaying: attr('boolean'),
  latestMessageDate: attr('number'),
  isOnline: attr('boolean'),
  hasNewMessages: attr('boolean'),
  safeProfilePic: computed('profilePic', function () {
    if (!this.profilePic || this.profilePic.length === 0) {
      return '/assets/monalisa.png'
    } else {
      return this.profilePic
    }
  }),
  lastMessage: attr('string'),
  displayName: computed('Username', 'firstName', 'lastName', function () {

    let username = this.get('Username');
    let firstName = this.get('firstName');
    let lastName = this.get('lastName');

    if (!username) {
      return [firstName, lastName].join(" ");
    }

    if (username.includes('@')) {
      return username.split('@')[0];
    }

    return username;
  })
});
