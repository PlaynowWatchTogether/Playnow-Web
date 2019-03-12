import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    triggerSearch() {
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    }
  }
});
