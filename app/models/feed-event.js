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
  seatsTotal:computed('content', function(){
    return this.get('obj.seats.available');
  }),
  seatsOccupied: computed('content', function(){
    return Object.keys(this.get('obj.Members')||{}).length;
  }),
  eventDate: computed('content', function(){
    const date = this.get('obj.date.date');
    return moment(date,"MM/DD/YYYY");
  }),
  eventStart: computed('content', function(){
    const date = this.get('obj.date.date');
    const from = this.get('obj.date.timeStart');
    return moment(`${date} ${from}`,'"MM/DD/YYYY h:mmA"');
  }),
  eventEnd: computed('content', function(){
    const date = this.get('obj.date.date');
    const from = this.get('obj.date.timeEnd');
    return moment(`${date} ${from}`,"MM/DD/YYYY h:mmA");
  }),
  commentsCount: computed('content', function(){
    return this.get('obj.commentsCount') || 0;
  }),
  likesCount: computed('content', function(){
    return this.get('obj.likesCount') || 0;
  }),
  Comments: computed('content', function(){
    return this.get('obj.Messages');
  }),
  Members: computed('content', function(){
    return Object.values(this.get('obj.Members')||{});
  }),
  isPast: computed('content', function(){
    const eventEnd = this.get('eventEnd');
    const now = moment();
    return eventEnd.isBefore(now);
  })


});
