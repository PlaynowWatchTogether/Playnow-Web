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
  }
});
