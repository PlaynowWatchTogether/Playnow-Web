import Component from '@ember/component';
import {computed} from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  classNameBindings: ['isSelected:selected'],
  click() {
    this.get('onChipClick')(this.get('model'));
  },
  isSelected: computed('model', 'selectedChip', function () {
    let model = this.get('model');
    let selected = this.get('selectedChip');
    let sel = model === selected;
    if (sel) {
      $(this.element).focus();
    }
    return sel;
  })
});
