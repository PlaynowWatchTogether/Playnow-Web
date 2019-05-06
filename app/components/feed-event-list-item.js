import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';
import {inject as service} from '@ember/service';
import FeedEventItemHelper from '../mixins/feed-event-item-helper';
export default Component.extend(FeedEventItemHelper, {
  actions: {
    openDetails(){
      this.get('onDetails')(this.get('model'));
    }
  }
});
