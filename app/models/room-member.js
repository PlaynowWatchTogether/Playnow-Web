import DS from 'ember-data';
import {computed} from '@ember/object';

const {attr} = DS;
export default DS.Model.extend({
  roomId: attr('string'),
  member: attr('string'),
  memberId: attr('string'),
  profilePic: computed('member', function () {
    let payload = JSON.parse(this.get('member'));
    if (!payload['ProfilePic'] || payload['ProfilePic'].length === 0) {
      return '/assets/monalisa_rect.png'
    } else {
      return payload['ProfilePic']
    }
  })
});
