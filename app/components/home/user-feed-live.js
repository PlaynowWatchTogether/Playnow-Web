import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  playingVideoIconUrl: computed(function(){
    const kind = this.get('videoState.videoType');
    if (kind === 'youtube#video' || kind === 'youtube#music'){
      return '/assets/ic-video-provider-youtube-active@2x.png';
    }
    if (kind === 'crunchyroll#media'){
      return '/assets/ic-video-provider-crunchroll-active@2x.png';
    }
    if (kind === 'khan#media'){
      return '/assets/ic-video-provider-khan-active@2x.png';
    }
    return '';
  })
});
