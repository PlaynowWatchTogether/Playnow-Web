import DS from 'ember-data';
import EmberObject, {computed} from '@ember/object';

const {attr, belongsTo, hasMany} = DS;
export default DS.Model.extend({
  ProfilePic: attr('string'),
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
