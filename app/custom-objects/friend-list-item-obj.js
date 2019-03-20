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
  }),
  filterTitle: computed('model', function () {
    if (this.type === 'friend') {
      return this.get('firstName') + ' ' + this.get('lastName');
    } else {
      return this.get('GroupName');
    }
  })
});
