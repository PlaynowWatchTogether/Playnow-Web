import Component from '@ember/component';
import {computed} from "@ember/object";

export default Component.extend({
  profilePic: computed('model', function () {
    let m = this.get('model');
    if (!m['ProfilePic'] || m['ProfilePic'].length === 0) {
      return '/assets/monalisa.png';
    } else {
      return m['ProfilePic'];
    }
  }),
  name: computed('model', function () {
    let m = this.get('model');
    return m['Name'];
  }),
  username: computed('model', function () {
    let m = this.get('model');
    return m['Username'];
  }),
  isAdded: computed('sent', function () {
    return false
  }),
  actions: {
    confirmRequest() {
      this.actionHandler(1, this.get('model'))
    },
    cancelRequest() {
      this.actionHandler(0, this.get('model'))
    }
  }

});
