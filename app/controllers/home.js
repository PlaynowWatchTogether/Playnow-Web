import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    chatFriend(friend) {
      this.transitionToRoute('home.chat', {chat_id: friend.id, type: 'one2one'});
    }
  }
});
