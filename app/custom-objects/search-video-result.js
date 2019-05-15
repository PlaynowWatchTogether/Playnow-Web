import EmberObject from '@ember/object';
import {debug} from "@ember/debug";
import {Promise} from 'rsvp';
import { computed } from '@ember/object';
export default EmberObject.extend({
  thumbnail: computed('data', function(){
    if (this.data.kind === 'youtube#video'){
      return this.data['snippet']['thumbnails']['medium']['url'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return this.data.data.screenshot_image.large_url;
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.video.thumbnailUrls.default;
    }
    return '';
  }),
  iconUrl: computed('data', function(){
    if (this.get('data').kind === 'youtube#video'){
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
    if (this.get('data').kind === 'youtube#video'){
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
    if (this.get('data').kind === 'youtube#video'){
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
    if (this.get('data').kind === 'youtube#video'){
      return this.get('data')['snippet']['publishedAt'];
    }
    if (this.data.kind === 'crunchyroll#media'){
      return this.data.data.created;
    }
    if (this.data.kind === 'khan#media'){
      return this.data.data.lastWatched;
    }
    return '';

  })

});
