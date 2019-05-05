import Component from '@ember/component';
import {computed} from '@ember/object';
import moment from 'moment';
import YoutubeVideoView from '../mixins/youtube-video-view';

export default Component.extend(YoutubeVideoView, {
  classNameBindings: ['isRemovable:removable'],
  click() {
    if (!this.get('displayRequest') && !this.get('isRemovable')){
      this.clickAction(this.get('model'));
    }
  },
  actions:{
    requestVideo(){
      this.clickAction(this.get('model'));
    },
    removeVideo(){
      this.removeAction(this.get('model'))
    }
  }
});
