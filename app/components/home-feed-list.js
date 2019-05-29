import Component from '@ember/component';

export default Component.extend({
  classNameBindings:['isLoading:loading'],
  actions:{
    followGroup(model){
      this.get('onFollowGroup')(model);
    },
    unFollowGroup(model){
      this.get('onUnFollowGroup')(model);
    },
    onJoinEvent(group, event){
      this.get('onJoinEvent')(group, event);
    },
    onLeaveEvent(group, event){
      this.get('onLeaveEvent')(group, event);
    }
  }
});
