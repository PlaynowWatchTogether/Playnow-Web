import DS from 'ember-data';
import {computed} from '@ember/object';

const {attr} = DS;
export default DS.Model.extend({
  profilePic: attr('string'),
  Username: attr('string'),
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
  lastMessage: attr('string')
});
