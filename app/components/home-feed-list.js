import Component from '@ember/component';

export default Component.extend({
  actions:{
    followGroup(model){
      this.get('onFollowGroup')(model);
    },
    unFollowGroup(model){
      this.get('onUnFollowGroup')(model);
    }
  }
});
