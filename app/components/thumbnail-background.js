import Component from '@ember/component';
import {computed} from '@ember/object';
import {htmlSafe} from '@ember/template'

export default Component.extend({
  attributeBindings: ['style'],
  style: computed('model', function () {
    return htmlSafe(`background-image: url(${this.get('model')})`);
  })
});
