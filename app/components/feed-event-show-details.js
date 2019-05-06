import Component from '@ember/component';
import { computed } from '@ember/object';
import FeedEventItemHelper from '../mixins/feed-event-item-helper';
export default Component.extend(FeedEventItemHelper, {
  modelMembers: computed('model.Members.@each.id','searchTerm', function(){
    const term = this.get('searchTerm');
    return this.get('model.Members').filter((elem)=>{
      if (!term || term.length === 0){
        return true;
      }
      const username = elem.Username.toLowerCase();
      return username.includes(term.toLowerCase());
    })
  }),
  actions: {
    cancelShowEvent(){
      this.get('cancelShowEvent')();
    },
    deleteEvent(){
      this.get('deleteEvent')(this.get('model'));
    }
  }
});
