import Component from '@ember/component';
import moment from 'moment';
import { computed } from '@ember/object';

export default Component.extend({
  modelDate: computed('model', function(){
    return (this.get('model.eventDate')||moment()).format("dddd, MMM D");
  }),
  modelStart: computed('model', function(){
    return (this.get('model.eventStart')||moment()).format("hh:mm A");
  }),
  modelEnd: computed('model', function(){
    return (this.get('model.eventEnd')||moment()).format("hh:mm A");
  }),
});
