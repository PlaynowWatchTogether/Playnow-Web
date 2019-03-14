import Component from '@ember/component';
import EmberObject, {computed} from '@ember/object';

export default Component.extend({
  actions: {
    chatFriend() {
      this.chatAction(this.get('model'));
    }
  },
  playingClass: computed('model.videoIsPlaying', function () {
    return this.get('model.videoIsPlaying') ? 'playing' : '';
  }),
  click() {
    this.chatAction(this.get('model'));
  },
  safeProfilePic: computed('model.ProfilePic', function () {
    let m = this.get('model');
    if (!m['ProfilePic'] || m['ProfilePic'].length === 0) {
      return '/assets/monalisa.png'
    } else {
      return m['ProfilePic']
    }
  }),
});
