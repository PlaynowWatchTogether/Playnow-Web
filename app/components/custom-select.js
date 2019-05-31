import Component from '@ember/component';
import {computed} from '@ember/object';
import J from 'jquery';
import {set} from '@ember/object';

export default Component.extend({
  tagName: 'select',
  selectedModel: computed('model', 'selected', function () {
    let selected = this.get('selected');
    return this.get('model').map((elem) => {
      set(elem, 'isSelected', String(selected) === String(elem.id));
      return elem;
    })
  }),
  change() {
    this.get('onChange')($(this.element).val());
  }

});
