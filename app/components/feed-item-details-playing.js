import Component from '@ember/component';

export default Component.extend({
  actions:{
    joinLive(){
      this.get('joinLive')();
    }
  }
});
