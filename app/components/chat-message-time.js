import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  dateFormat: computed('model', function () {
    if (new Date().getFullYear() === this.get('model').getFullYear()) {
      return 'ddd D MMM'
    } else {
      return 'DD-MM-YYYY'
    }
  })
});
