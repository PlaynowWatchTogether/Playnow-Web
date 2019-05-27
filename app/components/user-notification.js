import Component from '@ember/component';

export default Component.extend({
  click(){
    this.get('openDetails')(this.get('model'));
  },
  actions:{
    clearNotification(){
      this.get('clearNotification')(this.get('model'));
    }
  }
});
