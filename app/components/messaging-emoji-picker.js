import Component from '@ember/component';
import J from 'jquery';
export default Component.extend({
  didInsertElement(){
    this._super(...arguments);    
    $(this.element).on('click','.emoji-back', (e)=>{
      e.stopPropagation();
      this.set('displayEmoji',false);
      return false;
    });
  },
  actions:{
    toggleEmoji(){
      this.toggleProperty('displayEmoji');
    },
    selectEmoji(emoji){
      this.get('onSelectEmoji')(emoji);
    },
  }
});
