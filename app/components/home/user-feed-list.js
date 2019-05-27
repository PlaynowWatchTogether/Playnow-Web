import Component from '@ember/component';

export default Component.extend({
  classNames:"home-user-feed",
  actions: {
    openDetails(feed,live){
      this.get('openDetails')(feed,live);
    }
  }
});
