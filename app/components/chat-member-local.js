import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  classNameBindings: ['isStreamingMic:streaming-mic','model.streaming.video:streaming-video','isLarge:large'],
  init(){
    this._super(...arguments);
    this.set('oldStreaming',false);
    this.addObserver('model.streaming.mic', this,'streamingChanged');
    this.addObserver('model.streaming.video', this,'streamingChanged');
  },
  streamingChanged(obj){
    const streaming = obj.get('isStreaming');
    const old = obj.get('oldStreaming');
    if (streaming && !old){
       obj.set(`large.${this.elementId}`,true);
    }
    if (!streaming && old){
       obj.set(`large.${this.elementId}`,false);
    }
    obj.set('oldStreaming',streaming);
    obj.set('lastUpdate', new Date());
  },
  isStreaming: computed('model.streaming.{mic,video}',function(){
    return this.get('model.streaming.mic') || this.get('model.streaming.video');
  }),
  isStreamingMic: computed('model.streaming.mic', function(){
    return this.get('model.streaming.mic');
  }),
  isMuted: computed('model.streaming.{mic,video}',function(){
    return !this.get('model.streaming.mic') && this.get('model.streaming.video');
  }),
  isLarge:computed('large','lastUpdate','isLoading', function(){
    return this.get('large')[this.elementId] || this.get('isLoading');
  })
});
