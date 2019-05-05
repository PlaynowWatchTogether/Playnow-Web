import Component from '@ember/component';
import { debug } from '@ember/debug';
import {inject as service} from '@ember/service';
import { Promise } from 'rsvp';

export default Component.extend({
  classNames:'chat-playlist',
  youtubeSearch: service(),
  init(){
    this._super(...arguments);
    this.addObserver('playlistUrl', this, 'onUrlChanged');
  },
  onUrlChanged(obj){
    debug(`url changed to ${this.get('playlistUrl')}`);
    this.set('videoError', null);
    this.set('videoModel', null);
  },
  queryUrl(url){
    return new Promise((resolve, reject)=>{
      const youtube = url.match(/https:\/\/www.youtube.com\/watch\?v=(.*)/)
      if (youtube && youtube.length>1){
        const id = youtube[1];
        this.get('youtubeSearch').video(id).then((video)=>{
          if (video){
            resolve(video);
          }else{
            reject('Video not found');
          }
        });
        return;
      }
      reject('Invalid url');
    })
  },
  actions:{
    enableEdit(){
      this.set('playlistUrl',null);
      this.set('isEditing', true);
    },
    disableEdit(){
      this.set('playlistUrl',null);
      this.set('isEditing', false);
    },
    searchVideo(){
      const url = this.get('playlistUrl');
      if (!url || url.length == 0){
        return;
      }

      this.queryUrl(url).then((video)=>{
        debug(JSON.stringify(video));
        this.set('videoModel',video);
      }).catch((error)=>{
        this.set('videoError', error);
      })
    },
    videoPick(video){
      this.get('onVideoPick')(video);
    },
    videoRemove(video){
      this.get('onRemoveVideo')(video).then(()=>{

      });
    },
    addVideo(){
      this.get('onAddVideo')(this.get('videoModel')).then(()=>{
        this.set('playlistUrl', null);
      });
    }
  }
});
