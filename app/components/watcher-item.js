import Component from '@ember/component';
import {computed} from '@ember/object'
import {htmlSafe} from '@ember/template'

export default Component.extend({
  profilePic: computed('model', function () {
    let m = this.get('model');
    if (!m['ProfilePic'] || m['ProfilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['ProfilePic']
    }
  }),
  zIndex: computed('index', function () {
    return 10 - this.get('index');
  }),
  leftMargin: computed('index', function () {
    return 0 - this.get('index') * 10;
  }),
  myStyle: computed('index', function () {
    let index = this.get('index');
    return htmlSafe("z-index: " + (10 - index) + '; margin-left: ' + (-10) + 'px;');
  }),
  display: computed('model', 'streamer', function () {
    if (this.get('streamer')) {
      return this.get('index') === 0;
    }
    return this.get('index') !== 0;
  })
});
