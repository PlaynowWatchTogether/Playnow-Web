import Controller from '@ember/controller';
import {computed} from '@ember/object';
import { inject as service} from '@ember/service';

export default Controller.extend({
  support: service(),
  topics: computed(function(){
    return this.get('support').topics();
  })
});
