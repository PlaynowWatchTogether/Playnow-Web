import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);

    this.loading = true;
    this.model = []
    this.db.rooms((items) => {
      this.set('model', items);
      this.set('loading', false);
    }, () => {
      this.set('model', []);
      this.set('loading', false);
    })
  }
});
