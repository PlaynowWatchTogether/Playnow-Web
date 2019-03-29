import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';

export default Component.extend({
  videoThumbnail: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['thumbnails']['medium']['url']
  }),
  videoTitle: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['title'];
  }),
  channelTitle: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['channelTitle'];
  }),
  channelDesc: computed('model', function () {
    let m = this.get('model');
    return moment(m['snippet']['publishedAt']).fromNow()
  }),
  click() {
    this.clickAction(this.get('model'));
  }
});
