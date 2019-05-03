import Mixin from '@ember/object/mixin';
import ArrayProxy from '@ember/array/proxy';
import { computed } from '@ember/object';

export default Mixin.create({

  init(){
    this._super(...arguments);
    this.messages = ArrayProxy.create({content: []});
    this.messagesLimit = 100;
  },
  resetMessages(){
    this.messages.setObjects([]);
    this.set('messagesLimit',100);
  },
  updateMessages(messages){
    this.messages.setObjects(messages);
  },
  filteredMessages: computed('messages.@each.id', 'messagesLimit', function () {
    let messages = (this.get('messages') || []);
    let length = messages.length;
    let limit = this.get('messagesLimit');
    let fltrMessages = this.store.peekAll('thread-message').filter((elem) => {
      return elem.get('convoId') === this.messageConvId();
    }).slice(Math.max(0, length - limit), length + 1);
    return fltrMessages;
  }),
  hasMoreMessages: computed('messages.@each.id', 'limit', function () {
    let messages = (this.get('messages') || []);
    let length = messages.length;
    return this.get('limit') <= length;
  }),
  totalMessages: computed('messages', function () {
    return (this.get('messages') || []).length;
  }),
  loadMoreMessages(){
    this.set('messagesLimit', this.get('messagesLimit') + 100);
  }
});
