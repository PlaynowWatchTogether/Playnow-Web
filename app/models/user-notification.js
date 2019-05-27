import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
export default DS.Model.extend({
  elemId: attr('string'),
  createdAt: attr('number'),
  type: attr('string'),
  body: attr('string'),
  title: attr('string')
});
