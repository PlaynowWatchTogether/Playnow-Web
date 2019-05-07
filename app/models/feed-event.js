import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import moment from 'moment';
export default DS.Model.extend({
  feedId: attr('string'),
  content: attr('string'),
  obj:computed('content', function(){
    return JSON.parse(this.get('content')) || {};
  })

});
