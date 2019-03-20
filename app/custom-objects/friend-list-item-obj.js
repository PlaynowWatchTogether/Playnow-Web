import EmberObject from '@ember/object';
import {computed} from '@ember/object';

export default EmberObject.extend({
  model: null,
  type: '',
  latestMessageDate: computed('model', function () {
    return this.get('model.latestMessageDate');
  }),
  id: computed('model', function () {
    return this.get('model.id');
  }),
  isFriend: computed('model', function () {
    return this.type === 'friend'
  })
});
