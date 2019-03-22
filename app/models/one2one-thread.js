import DS from 'ember-data';
import EmberObject, {computed} from '@ember/object';

const {attr, belongsTo, hasMany} = DS;
export default DS.Model.extend({
  convoId: attr('string'),
  messages: hasMany('one2one-message')
});
