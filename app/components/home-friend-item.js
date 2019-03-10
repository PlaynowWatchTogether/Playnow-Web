import Component from '@ember/component';

export default Component.extend({
  actions: {
    chatFriend() {
      this.chatAction(this.get('model'));
    }
  },
  click() {
    this.chatAction(this.get('model'));
  }
});
