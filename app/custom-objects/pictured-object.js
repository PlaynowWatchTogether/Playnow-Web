import ObjectProxy from '@ember/object/proxy';
import {computed} from '@ember/object';

export default ObjectProxy.extend({

  profilePic: computed('content', function () {
    let payload = this.get('content');
    if (!payload['ProfilePic'] || payload['ProfilePic'].length === 0) {
      return '/assets/monalisa_rect.png'
    } else {
      return payload['ProfilePic']
    }
  })
});
