import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import { get } from '@ember/object';
import FeedActionsMixins from '../../mixins/feed/feed-actions';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import {debug} from '@ember/debug';
export default Component.extend(FeedActionsMixins, {
  store: service(),
  db: service(),
  init(){
    this._super(...arguments);
    addObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
  },
  feedUpdated(obj){
    this.set('lastUpdateFeed',new Date());
  },
  willDestroyElement(){
    this._super(...arguments);
    removeObserver(this.get('db'),'feedUpdated', this,'feedUpdated');
  },
  click(){
    this.get('openDetails')(this.get('localFeed'));
  },
  isLive: computed('model.type', function(){
    return this.get('model.type') === 'live';
  }),
  isMessage: computed('model.type', function(){
    return this.get('model.type') === 'message';
  }),
  liveActive:computed('model.{lastUpdate}','localFeed.lastUpdate','lastUpdateFeed', function(){
    const lfeed = this.store.peekRecord('feed-item', this.get('model.feedId'));
    if (lfeed){
      return this.get('model.content.videoId') === get(lfeed,'videoState.videoId') && get(lfeed,'isPlaying');
    }else{
      return null;
    }
  }),
  isEvent: computed('model.type', function(){
    return this.get('model.type') === 'event';
  }),
  localEvent: computed('model.{content.id,lastUpdate}', function(){
    if (this.get('model.content.id')){
      const id = this.get('model.content.id');
      const feed = this.store.peekRecord('feed-event', id);
      return feed;
    }
    return null;
  }),
  localFeedMessage: computed('localFeed.{lastUpdate}','model', function(){
    const feed = this.get('localFeed');
    if (feed){
      let messages = feed.get('Messages')||{};
      return messages[this.get('model.content.uid')];
    }else{
      return null;
    }
  }),
  localFeed: computed('model.{feedId,lastUpdate}','lastUpdate','lastUpdateFeed', function(){
    if (this.get('model.feedId')){
      const id = this.get('model.feedId');
      const feed = this.store.peekRecord('feed-item', id);
      return feed;
    }else{
      return null;
    }
  })
});
