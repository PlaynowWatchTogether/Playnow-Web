import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service} from '@ember/service';
import BroadcastStreamer from '../custom-objects/broadcast-streamer';
import J from 'jquery';
import { debug } from '@ember/debug';
export default Component.extend({
  db: service(),
  init(){
    this._super(...arguments);
    this.streamer = BroadcastStreamer.create();

  },
  mediaUrl:computed('model', function(){
    return `https://stream.tunebrains.com/WebRTCApp/streams/${this.get('model.stream')}.ts`;
  }),
  videoElemId: computed(function(){
    return `${this.elementId}-video`;
  }),
  didInsertElement(){
    this._super(...arguments);
    this.streamer.playStream(`#${this.elementId}`,this.get('model.stream'), this.get('db').myId());
    // this.tryToPlay(this.get('model.stream'));
  },
  willDestroyElement(){
    this.streamer.stopStream(`#${this.elementId}`,this.get('model.stream'),this.get('db').myId());
    this._super(...arguments);
  }
});
