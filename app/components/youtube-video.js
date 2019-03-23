import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  videoThumbnail: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['thumbnails']['medium']['url']
  }),
  videoTitle: computed('model', function () {
    let m = this.get('model');
    return m['snippet']['title'];
  }),
  click() {
    this.clickAction(this.get('model'));
  }
});
