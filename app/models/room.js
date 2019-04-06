import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
export default DS.Model.extend({
  creatorName: attr('string'),
  videoName: attr('string'),
  videoThumbnail: attr('string'),
  viewersCount: attr('number'),
  rawData: attr('string'),
  lastUpdate: attr('number'),
  videoWatching: computed('rawData', function () {
    let rawData = this.get('rawData');
    if (rawData) {
      return JSON.parse(rawData)['videoWatching']
    } else {
      return null;
    }
  })
});
