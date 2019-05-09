import DS from 'ember-data';
import {computed} from '@ember/object';
const {attr} = DS;
import moment from 'moment';
import ModelAccess from '../mixins/feed-event-model-access';
import ProxyMixin from '../mixins/proxy-mixin'
export default DS.Model.extend(ModelAccess, ProxyMixin, {
  feedId: attr('string'),
  rawData: attr('string'),
  content:computed('rawData', function(){
    return JSON.parse(this.get('rawData')) || {};
  })

});
