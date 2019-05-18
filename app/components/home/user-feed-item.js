import Component from '@ember/component';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import { get } from '@ember/object';
import FeedActionsMixins from '../../mixins/feed/feed-actions';
import { addObserver } from '@ember/object/observers';
import { removeObserver } from '@ember/object/observers';
import {debug} from '@ember/debug';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
import FeedEventModelWrapper from '../../custom-objects/feed-event-model-wrapper';
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
  click(event){
    if ($(event.target).closest('.post-comments').length>0){
      return;
    }
    this.get('openDetails')(this.get('localFeed'));
  },
  isLive: computed('model.type', function(){
    return this.get('model.type') === 'live';
  }),
  isMessage: computed('model.type', function(){
    return this.get('model.type') === 'message';
  }),
  liveActive:computed('localFeed', function(){
    const lfeed = this.get('localFeed');
    return this.get('model.content.videoId') === get(lfeed,'videoState.videoId') && get(lfeed,'isPlaying');
  }),
  isEvent: computed('model.type', function(){
    return this.get('model.type') === 'event';
  }),
  localEvent: computed('model.feedEvent', function(){
    return FeedEventModelWrapper.create({content:this.get('model.feedEvent')});
  }),
  localFeedMessage: computed('model.feedMessage',function(){
    return this.get('model.feedMessage');
  }),
  localFeed: computed('model.localFeed',function(){
    return FeedModelWrapper.create({content:this.get('model.localFeed')});
  })
});
