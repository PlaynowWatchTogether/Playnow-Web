import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  auth: service(),
  db: service(),
  actions: {
    triggerSearch() {
      this.transitionToRoute('search', {query: this.get('searchQuery')});
    },
    logout() {
      this.get('auth').logout();
    },
    followerAction(action, model) {
      if (action === 1) {
        //confirm
        this.get('db').confirmRequest(model);
      } else {
        //cancel
        this.get('db').cancelRequest(model);
      }
    }
  }
});
