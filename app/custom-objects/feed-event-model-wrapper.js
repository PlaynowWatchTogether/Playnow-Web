import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';
import moment from 'moment';
import { get } from '@ember/object';

export default ObjectProxy.extend({
  isSeatsUnlimited: computed('seatsTotal', function(){
    return this.get('seatsTotal') === -1;
  }),
  seatsTotal:computed('content', function(){
    return this.get('content.seats.available');
  }),
  seatsOccupied: computed('content', function(){
    return Object.keys(this.get('content.Members')||{}).length;
  }),
  eventDate: computed('content', function(){
    const date = this.get('content.date.date');
    return moment(date,"MM/DD/YYYY");
  }),
  eventStart: computed('content', function(){
    const date = this.get('content.date.date');
    const from = this.get('content.date.timeStart');
    return moment(`${date} ${from}`,'"MM/DD/YYYY h:mmA"');
  }),
  eventEnd: computed('content', function(){
    const date = this.get('content.date.date');
    const from = this.get('content.date.timeEnd');
    return moment(`${date} ${from}`,"MM/DD/YYYY h:mmA");
  }),
  commentsCount: computed('content', function(){
    return this.get('content.commentsCount') || 0;
  }),
  likesCount: computed('content', function(){
    return this.get('content.likesCount') || 0;
  }),
  Comments: computed('content', function(){
    return this.get('content.Messages');
  }),
  Members: computed('content', function(){
    return Object.values(this.get('content.Members')||{});
  }),
  isPast: computed('content', function(){
    const eventEnd = this.get('eventEnd');
    const now = moment();
    return eventEnd.isBefore(now);
  })
});
