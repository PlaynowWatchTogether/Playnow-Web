import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import moment from 'moment';
import ProxyMixin from '../mixins/proxy-mixin'
export default DS.Model.extend(ProxyMixin, {
  createdAt: attr('number'),
  type: attr('string'),
  feedId: attr('string'),
  lastUpdate: attr('number'),
  rawData: attr('string'),
  rawLocalFeed: attr('string'),
  rawFeedMessage: attr('string'),
  rawFeedEvent: attr('string'),
  content:computed('rawData', function(){
    return JSON.parse(this.get('rawData')) || {};
  }),
  localFeed: computed('rawLocalFeed', function(){
    return JSON.parse(this.get('rawLocalFeed')) || {};
  }),
  feedMessage: computed('rawFeedMessage', function(){
    return JSON.parse(this.get('rawFeedMessage')) || {};
  }),
  feedEvent: computed('rawFeedEvent', function(){
    return JSON.parse(this.get('rawFeedEvent')) || {};
  })


});
