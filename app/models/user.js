import DS from 'ember-data';
import {computed} from '@ember/object';

const {attr} = DS;
export default DS.Model.extend({
  ProfilePic: attr('string'),
  Username: attr('string'),
  Email: attr('string'),
  BirthDate: attr('string'),
  FirstName: attr('string'),
  LastName: attr('string'),
  LastActiveDate: attr('string'),
  safeProfilePic: computed('profilePic', function () {
    if (!this.ProfilePic || this.ProfilePic.length === 0) {
      return '/assets/monalisa.png'
    } else {
      return this.ProfilePic
    }
  })

});
