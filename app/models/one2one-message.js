import DS from 'ember-data';
import EmberObject, {computed} from '@ember/object';

const {attr, belongsTo, hasMany} = DS;
export default DS.Model.extend({
  convoId: attr('string'),
  date: attr('number'),
  message: attr('string'),
  senderId: attr('string'),
  senderName: attr('string'),
  text: attr('string'),
  thumbnail: attr('string'),
  type: attr('string'),
  uid: attr('string'),
  userId: attr('string'),
});
