import Component from '@ember/component';
import moment from 'moment';
import { computed } from '@ember/object';

export default Component.extend({
  modelDate: computed('model', function(){
    return this.get('model.eventDate').format("dddd, MMM D");
  }),
  modelStart: computed('model', function(){
    return this.get('model.eventStart').format("hh:mm A");
  }),
  modelEnd: computed('model', function(){
    return this.get('model.eventEnd').format("hh:mm A");
  }),
});
