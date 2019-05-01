import DS from 'ember-data';

const {attr} = DS;
export default DS.Model.extend({
  GroupName: attr('string'),
  hasNewMessages: attr('boolean'),
  isOnline: attr('boolean'),
  videoType: attr('string'),
  latestMessageDate: attr('number'),
  lastMessage: attr('string'),
  groupPics: attr('string'),
  ProfilePic: attr('string')
});
