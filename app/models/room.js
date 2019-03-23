import DS from 'ember-data';

const {attr} = DS;
export default DS.Model.extend({
  creatorName: attr('string'),
  videoName: attr('string'),
  videoThumbnail: attr('string'),
  viewersCount: attr('number')

});
