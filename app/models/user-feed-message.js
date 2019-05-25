import DS from 'ember-data';
import moment from 'moment';
import {computed} from '@ember/object';
const {attr} = DS;
import ArrayUniqObject from '../custom-objects/array-uniq-object';
import ProxyMixin from '../mixins/proxy-mixin';
export default DS.Model.extend(ProxyMixin,{
  convoId: attr('string'),
  rawData: attr('string'),
  isSeen: attr('boolean'),
  init(){
    this._super(...arguments);

    this.set('ItemComments',ArrayUniqObject.create({on: this, key:'content.Comments',uniqKey: 'uid'}));
  },
  json: computed('rawData', function () {
    return JSON.parse(this.get('rawData'))
  }),
  isMessage: computed('json.isMessage', function () {
    return this.get('json.isMessage');
  }),
  isLoading: computed('json.isLoading', function () {
    return this.get('json.isLoading');
  }),
  isDate: computed('json.isDate', function () {
    return this.get('json.isDate');
  }),
  date: computed('content.date', function () {
    return new Date(this.get('content.date'))
  }),
  content: computed('json', function () {
    return this.get('json').message;
  }),
  displaySender: computed('json.displaySender', function () {
    return this.get('json.displaySender');
  }),
  senderSpace: computed('json.senderSpace', function(){
    return this.get('json.senderSpace')
  })
});
