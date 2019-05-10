import DS from 'ember-data';
import moment from 'moment';
import {computed} from '@ember/object';
const {attr} = DS;
export default DS.Model.extend({
  convoId: attr('string'),
  content: attr('string'),
  message: computed('json.message', function () {
    return this.get('json.message')
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
  json: computed('content', function () {
    return JSON.parse(this.get('content'));
  }),
  date: computed('json.date', function () {
    return new Date(this.get('json.message.date'))
  }),
  displaySender: computed('json.displaySender', function () {
    return this.get('json.displaySender');
  }),
  senderSpace: computed('json.senderSpace', function(){
    return this.get('json.senderSpace')
  })
});
