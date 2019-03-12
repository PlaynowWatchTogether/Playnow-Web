import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  db: service(),
  init() {
    this._super(...arguments);
  }
});
