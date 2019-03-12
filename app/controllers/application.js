import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  auth: service(),
  actions: {
    triggerSearch() {
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    },
    logout() {
      this.get('auth').logout();
    }
  }
});
