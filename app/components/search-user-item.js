import Component from '@ember/component';
import {computed} from '@ember/object'

export default Component.extend({
  isAdded: computed('model', 'sent', function () {
    let res = false;
    let model = this.get('model');
    this.get('sent').forEach((elem) => {
      if (elem.id === model.id) {
        res = true
      }
    });
    return res;
  }),
  actions: {
    addFriend() {
      this.addAction(this.get('model'));
      this.notifyPropertyChange('sent');
    }
  }
});
