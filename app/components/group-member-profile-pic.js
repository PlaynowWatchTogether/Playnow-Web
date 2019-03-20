import Component from '@ember/component';
import {htmlSafe} from '@ember/template'
import {computed} from '@ember/object'

export default Component.extend({
  classNameBindings: ['isHalf:half', 'isQuoter:quoter'],
  attributeBindings: ['style'],
  isHalf: computed('model', function () {
    let total = this.get('total');
    return total > 1;
  }),
  isQuoter: computed('model', function () {
    let total = this.get('total');
    let index = this.get('index');
    if (total === 2) {
      return false;
    } else if (total === 3) {
      return index > 1;
    }
    return false;
  }),
  style: computed('model', function () {
    return htmlSafe('background-image: url(' + this.get('model.profilePic') + ");");
  })
});
