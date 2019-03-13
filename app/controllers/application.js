import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  auth: service(),
  db: service(),
  actions: {
    triggerSearch() {
      let q = this.get('searchQuery');
      if (q.length !== 0) {
        this.transitionToRoute('search', {query: q});
      }
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
