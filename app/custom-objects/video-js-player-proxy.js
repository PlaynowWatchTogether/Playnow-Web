import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';

export default EmberObject.extend({
  getCurrentTime(){
    return this.player.currentTime();
  },
  getDuration(){
    return this.player.duration();
  }
});
