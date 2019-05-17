import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings: ["isStreamingMic:streaming-mic","isStreamingCamera:streaming-video"],
  isStreamingMic: computed('model.mic', function(){
    return this.get('model.mic');
  }),
  isStreamingCamera: computed('model.video', function(){
    return this.get('model.video');
  }),
  actions:{
    toggleMic(){
      this.get('onToggleMic')();
    },
    toggleCamera(){
      this.get('onToggleCamera')();
    }
  }
});
