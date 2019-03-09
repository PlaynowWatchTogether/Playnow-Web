import DS from 'ember-data';
import EmberObject, {computed} from '@ember/object';

const {attr, belongsTo, hasMany} = DS;
export default DS.Model.extend({
  creatorName: attr('string'),
  videoName: attr('string'),
  videoThumbnail: attr('string'),
  viewersCount: attr('number')

});
