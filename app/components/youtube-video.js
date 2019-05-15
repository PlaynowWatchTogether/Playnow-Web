import Component from '@ember/component';
import {computed} from '@ember/object';
import {get} from '@ember/object';
import moment from 'moment';
import YoutubeVideoView from '../mixins/youtube-video-view';

export default Component.extend(YoutubeVideoView, {
  classNameBindings: ['isRemovable:removable'],
  click() {
    if (!this.get('displayRequest') && !this.get('isRemovable')){
      this.clickAction(this.get('model'));
    }
  },
  isOnPlaylist: computed('model','playlistModel',function(){
    const videoId = this.get('model.id');
    const videos = this.get('playlistModel.videos')||[];
    let has = false;
    videos.forEach((vid)=>{
      if (get(vid,'id') === videoId){
        has = true;
        return;
      }
    });

    return has;
  }),
  actions:{
    requestVideo(){
      this.clickAction(this.get('model'));
    },
    removeVideo(){
      this.removeAction(this.get('model'))
    },
    addVideo(){
      this.addAction(this.get('model'));
    }
  }
});
