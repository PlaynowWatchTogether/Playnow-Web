import Component from '@ember/component';

export default Component.extend({
  actions: {
    chatFriend(model) {
      this.chatAction(model);
    }
  }
});
