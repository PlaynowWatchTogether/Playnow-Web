import Component from '@ember/component';
import {computed} from '@ember/object'

export default Component.extend({

  queriedModel: computed('model', 'friendsQuery', function () {
    if (!this.get('friendsQuery') || this.get('friendsQuery').length === 0) {
      return this.get('model').filter(() => {
        return true;
      })
    }
    let query = this.get('friendsQuery');
    return this.get('model').filter((elem) => {
      let title = '';
      if (elem.get('type') === 'friend') {
        title = elem.get('model.firstName') + ' ' + this.get('model.lastName');
      } else {
        title = elem.get('model.GroupName');
      }
      if (title) {
        return title.toLowerCase().includes(query.toLowerCase());
      } else {
        return false
      }
    })
  })

});
