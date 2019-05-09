import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import FeedEventItemHelper from '../mixins/feed-event-item-helper';
export default Component.extend(FeedEventItemHelper, {
  actions: {
    openDetails(){
      const act = this.get('onDetails');
      if (act){
          act(this.get('model'));
      }
    }
  }
});
