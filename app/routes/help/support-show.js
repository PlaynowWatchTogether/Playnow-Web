import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default Route.extend({
  support: service(),
  model(params){
    return this.get('support').topic(params.topic);
  }
});
