import Component from '@ember/component';
import {computed} from "@ember/object";
import {run} from '@ember/runloop';
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
  actions: {
    confirmRequest(event) {
      this.set('isAdded', true);
      setTimeout(() => {
        $(this.element).fadeOut(1000, () => {
          run(() => {
            this.actionHandler(1, this.get('model'));
          });
        });
      }, 1000);
      return false;
    },
    cancelRequest(event) {
      this.set('isRemoved', true);
      setTimeout(() => {
        $(this.element).fadeOut(1000, () => {
          run(() => {
            this.actionHandler(0, this.get('model'));
          });
        });
      }, 1000);
      return false;
    }
  }

});
