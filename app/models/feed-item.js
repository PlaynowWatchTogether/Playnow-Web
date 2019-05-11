import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import ProxyMixin from '../mixins/proxy-mixin'
import FeedItemAccessMixin from '../mixins/model/feed-item-model-access';
export default DS.Model.extend(ProxyMixin,FeedItemAccessMixin,{
  rawData:attr('string'),
  lastUpdate: attr('string'),
  obj: computed('rawData', function(){
    return JSON.parse(this.get('rawData'));
  }),
  content: computed('rawData', function(){
    return JSON.parse(this.get('rawData'));
  })  
});
