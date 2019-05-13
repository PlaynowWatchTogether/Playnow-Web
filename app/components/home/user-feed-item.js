import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import { get } from '@ember/object';
import FeedActionsMixins from '../../mixins/feed/feed-actions';

export default Component.extend(FeedActionsMixins, {
  store: service(),
  db: service(),
  click(){
    this.get('openDetails')(this.get('localFeed'));
  },
  isLive: computed('model.type', function(){
    return this.get('model.type') === 'live';
  }),
  isMessage: computed('model.type', function(){
    return this.get('model.type') === 'message';
  }),
  liveActive:computed('model.{lastUpdate}','localFeed.lastUpdate','db.userFeedUpdated','db.feedUpdatedComputed', function(){
    const lfeed = this.store.peekRecord('feed-item', this.get('model.feedId'));
    return this.get('model.content.videoId') === get(lfeed,'videoState.videoId') && get(lfeed,'isPlaying');
  }),
  isEvent: computed('model.type','db.userFeedUpdated','db.feedUpdatedComputed', function(){
    return this.get('model.type') === 'event';
  }),
  localEvent: computed('model.{content.id,lastUpdate}','db.userFeedUpdated','db.feedUpdatedComputed', function(){
    if (this.get('model.content.id')){
      return this.store.peekRecord('feed-event', this.get('model.content.id'));
    }
    return null;
  }),
  localFeedMessage: computed('localFeed.{lastUpdate}','model', function(){
    const feed = this.get('localFeed');
    let messages = feed.get('Messages');
    return messages[this.get('model.content.uid')];
  }),
  localFeed: computed('model.{feedId,lastUpdate}','db.userFeedUpdated','db.feedUpdatedComputed', function(){
    if (this.get('model.feedId')){
      return this.store.peekRecord('feed-item', this.get('model.feedId'));
    }else{
      return null;
    }
  })
});
