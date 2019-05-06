import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import moment from 'moment';
export default DS.Model.extend({
  feedId: attr('string'),
  content: attr('string'),
  obj:computed('content', function(){
    return JSON.parse(this.get('content')) || {};
  }),
  isSeatsUnlimited: computed('seatsTotal', function(){
    return this.get('seatsTotal') === -1;
  }),
  seatsTotal:computed('obj', function(){
    return this.get('obj.seats.available');
  }),
  seatsOccupied: computed('obj', function(){
    return Object.keys(this.get('obj.Members')||{}).length;
  }),
  eventDate: computed('obj', function(){
    const date = this.get('obj.date.date');
    return moment(date,"MM/DD/YYYY");
  }),
  eventStart: computed('obj', function(){
    const date = this.get('obj.date.date');
    const from = this.get('obj.date.timeStart');
    return moment(`${date} ${from}`,'"MM/DD/YYYY h:mmA"');
  }),
  eventEnd: computed('obj', function(){
    const date = this.get('obj.date.date');
    const from = this.get('obj.date.timeEnd');
    return moment(`${date} ${from}`,"MM/DD/YYYY h:mmA");
  }),
  commentsCount: computed('obj', function(){
    return this.get('obj.commentsCount') || 0;
  }),
  likesCount: computed('obj', function(){
    return this.get('obj.likesCount') || 0;
  }),
  Comments: computed('obj', function(){
    return this.get('obj.Messages');
  }),
  Members: computed('obj', function(){
    return Object.values(this.get('obj.Members')||{});
  })


});
