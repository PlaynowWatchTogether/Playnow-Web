import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  classNameBindings: ['isStreamingMic:streaming-mic','model.streaming.video:streaming-video'],
  isStreamingMic: computed('model.streaming.mic', function(){
    return this.get('model.streaming.mic');
  })
});
