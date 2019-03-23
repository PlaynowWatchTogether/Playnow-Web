import DS from 'ember-data';

const {attr} = DS;
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
