import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';

export default ObjectProxy.extend({
  type: '',
  profilePic: computed('content.ProfilePic', function () {
    return this.get('content.profilePic');
  }),
  latestMessageDate: computed('content.latestMessageDate', function () {
    let local = this.get('content.latestMessageDate');
    if (!local)
      return 0;
    if (local % 1 !== 0) {
      return local * 1000;
    }
    return local;
  }),
  id: computed('content', function () {
    return this.get('content.id');
  }),
  isFriend: computed('content', function () {
    return this.type === 'friend'
  }),
  filterTitle: computed('content', function () {
    if (this.type === 'friend') {
      return this.get('firstName') + ' ' + this.get('lastName');
    } else {
      return this.get('GroupName');
    }
  })
});
