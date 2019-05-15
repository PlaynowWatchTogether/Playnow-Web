import DS from 'ember-data';
import { computed } from '@ember/object';
const {attr} = DS;
export default DS.Model.extend({
  rawData: attr('string'),
  title: attr('string'),
  createdAt: attr('number')
});
