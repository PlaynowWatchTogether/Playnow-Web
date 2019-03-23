import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);

    this.loading = true;
    this.model = this.store.peekAll('friends');
    this.db.friends(() => {
      this.set('model', this.store.peekAll('friends').sortBy('latestMessageDate'));
      this.set('loading', false);
    }, () => {

    })
  }
});
