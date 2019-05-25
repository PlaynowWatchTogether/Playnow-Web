import Mixin from '@ember/object/mixin';
import {computed} from '@ember/object';
import moment from 'moment';
import { get } from '@ember/object';
import { debug } from '@ember/debug';
import ArrayProxy from '@ember/array/proxy';
import ArrayUniqObject from '../custom-objects/array-uniq-object';
export default Mixin.create({
  init(){
    this._super(...arguments);

    this.set('ItemComments',ArrayUniqObject.create({on: this, key:'content.Messages',uniqKey: 'uid'}));
  },
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
  eventStart: computed(function(){
    const date = this.get('content.date.date');
    const from = this.get('content.date.timeStart');
    return moment(`${date} ${from}`,'"MM/DD/YYYY h:mmA"');
  }),
  eventEnd: computed(function(){
    const date = this.get('content.date.date');
    const from = this.get('content.date.timeEnd');
    return moment(`${date} ${from}`,"MM/DD/YYYY h:mmA");
  }),
  commentsCount: computed('content.commentsCount', function(){
    return this.get('content.commentsCount') || 0;
  }),
  likesCount: computed('content.likesCount', function(){
    return this.get('content.likesCount') || 0;
  }),
  // Comments: computed('content.Messages.@each.id', function(){
    // return this.get('content.Messages');
  // }),
  Members: computed('content', function(){
    return Object.values(this.get('content.Members')||{});
  }),
  isPast: computed('content', function(){
    const eventEnd = this.get('eventEnd');
    const now = moment();
    return eventEnd.isBefore(now);
  }),
  title:  computed('content', function(){
    return this.get('content.title');
  }),
  description:  computed('content', function(){
    return this.get('content.description');
  })
});
