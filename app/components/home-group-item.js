import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';

export default Component.extend({
  playingClass: computed('model.videoType', function () {
    let type = this.get('model.videoType');
    if (type === 'youtubeVideo') {
      return 'playing-video'
    } else if (type === 'youtubeMusic') {
      return 'playing-music'
    } else {
      return ''
    }
  }),
  onlineClass: computed('model.isOnline', function () {
    return this.get('model.isOnline') ? 'online' : '';
  }),
  unreadClass: computed('model', function () {
    return this.get('model.hasNewMessages') ? 'unread' : '';
  }),
});
