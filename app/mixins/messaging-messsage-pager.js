import Mixin from '@ember/object/mixin';
import ArrayProxy from '@ember/array/proxy';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import $ from 'jquery';
import { run } from '@ember/runloop';
export default Mixin.create({
  DEFAULT_LIMIT:100,
  init(){
    this._super(...arguments);
    this.messages = ArrayProxy.create({content: []});
    this.messagesLimit = this.DEFAULT_LIMIT;
  },
  resetMessages(){
    this.messages.setObjects([]);
    this.set('messagesLimit',this.DEFAULT_LIMIT);
  },
  updateMessages(messages){
    this.messages.setObjects(messages);
  },
  scrollToIndex(foundIndex){
    setTimeout(()=>{
        run(()=>{
          const elem = $(`.messagesHolder [messageuid=${foundIndex}]`)
          var padding = Math.abs(Math.abs(elem.position().top-elem.offset().top));
          $('.messagesHolder').addClass('loading');
          $('.messagesHolder').animate({'scrollTop':$('.messagesHolder').scrollTop()+elem.offset().top-145-elem.height()}, ()=>{
            $('.messagesHolder').removeClass('loading');
            elem.addClass('blinks');
            setTimeout(()=>{
              elem.removeClass('blinks');
            },2000);
          });
        });
    },500);

  },
  allMessages: computed('messages.@each.{id,isLocal}','messagesLimit', function(){
    return this.store.peekAll('thread-message').filter((elem) => {
      return elem.get('convoId') === this.messageConvId();
    }).sort((a, b)=>{
      if (this.messageSortHandler){
        return this.messageSortHandler(a,b);
      }else{
        return get(a,'date').getTime() - get(b,'date').getTime()
      }
    })
  }),
  filteredMessages: computed('messages.@each.id', 'messagesLimit', function () {
    let messages = (this.get('messages') || []);
    let length = messages.length;
    let limit = this.get('messagesLimit');
    let fltrMessages = this.get('allMessages').slice(Math.max(0, length - limit), length + 1);
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
    this.set('messagesLimit', this.get('messagesLimit') + this.DEFAULT_LIMIT);
  },
  setLimitToMessageUID(uid){
    const allMessages = this.get('allMessages');
    let foundIndex = -1;
    allMessages.forEach((elem, index)=>{
      if (elem.get('uid') === uid){
        foundIndex = index;
      }
    });
    if (foundIndex!=-1){
      const minVisibleIndex = allMessages.length - this.get('messagesLimit');
      if (minVisibleIndex>foundIndex){
        const newLimit = this.get('messagesLimit')+(minVisibleIndex - foundIndex);
        this.set('messagesLimit', newLimit+this.DEFAULT_LIMIT);
      }
      this.scrollToIndex(uid);
    }
  }
});
