import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import { computed } from '@ember/object';
import { get } from '@ember/object';
export default EmberObject.extend({
  thumbnail: computed('data', function(){
    if (this.data.kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      const thumbnails = this.data.snippet.thumbnails;
      let max = {
        url: '',
        width: 0,
        height: 0
      };
      Object.values(thumbnails).forEach((elem)=>{
        if (elem.width > max.width || elem.height > max.height){
          max = elem;
        }
      });
      return get(max,'url');
    }
    if (this.data.kind === 'crunchyroll#media'){
      const url = this.data.data.screenshot_image.full_url;
      if (url && !url.includes('https://')){
        return url.replace('http://','https://');
      }
      return url;
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.thumbnailUrls.default;
    }
    return '';
  }),
  category: computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      let defCategory = this.get('data').kind === 'youtube#video' ? "" : "10";
      return this.data.snippet.categoryId || defCategory;
    }
    return '';
  }),
  iconUrl: computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      return '/assets/ic-video-provider-youtube-active@2x.png';
    }
    if (this.data.kind === 'crunchyroll#media'){
      return '/assets/ic-video-provider-crunchroll-active@2x.png';
    }
    if (this.data.kind === 'khan#media'){
      return '/assets/ic-video-provider-khan-active@2x.png';
    }
    return ''
  }),
  title: computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      return this.get('data')['snippet']['title'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return this.data['data']['name'];
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.title;
    }
    return '';
  }),
  description: computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      return this.get('data')['snippet']['channelTitle'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return this.data['data']['description'];
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.description;
    }
    return '';
  }),
  createdAt:computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      return this.get('data')['snippet']['publishedAt'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return this.data.data.created;
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.lastWatched;
    }
    return '';
  }),
  kind: computed('data', function(){
    return this.data.kind;
  }),
  url: computed('data.url', function(){
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.downloadUrls.mp4;
    } else if (this.data.kind === 'crunchyroll#media'){
      return this.data.url;
    }

    return '';
  }),
  playlistId: computed('data', function(){
    return this.get('data.playlistId');
  }),
  id: computed('data', function(){
    if (this.get('data').kind === 'youtube#video' || this.data.kind === 'youtube#music'){
      return this.get('data')['id'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return `${this.data.data.media_id}_${this.data.data.series_id}`;
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.readable_id || this.data.data.video.readableId;
    }

  })

});
