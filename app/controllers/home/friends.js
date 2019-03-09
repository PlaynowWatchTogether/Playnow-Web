import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);

    this.loading = true;
    this.model = []
    this.db.friends((data) => {
      this.set('loading', false);
      this.set('model', data);
    }, () => {
      this.set('loading', false);
      this.set('model', []);
    })
  }
});
