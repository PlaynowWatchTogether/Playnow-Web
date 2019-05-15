import Component from '@ember/component';
import VideoSearchMixin from '../mixins/videos-search-mixin';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import {debug} from '@ember/debug';
export default Component.extend(VideoSearchMixin, {
  loadingVideoClass: computed('isLoadingVideo', function () {
    return this.get('isLoadingVideo') ? 'active' : '';
  }),
  init(){
    this._super(...arguments);
    this.set('videoProviders',{khan: false, youtube: false, crunchyroll: false});
  },
  sectionTitle: computed('searchQueryVideo', function(){
    const query = this.get('searchQueryVideo');
    if (!query || query.length === 0){
      return 'Trending'
    }else{
      return htmlSafe(`Results for: ${query}`);
    }
  }),
  didInsertElement(){
    this._super(...arguments);
    this.queryVideos(true);
  },
  actions:{
    scrolledHalfYoutubeVideo() {
      debug('scrolledHalfYoutubeVideo');
      this.set('loadingVideo', true);
      this.queryVideos(false).then(() => {
        this.set('loadingVideo', false);
      });
    },
    triggerSearch() {
      this.set('searchQueryVideo', this.get('searchQuery'));
      this.queryVideos(true);
    },
    videoPick(video){
      this.get('onVideoPick')(video);
    },
    playlistVideoAdd(video){
      return this.get('onPlaylistAddVideo')(video);
    },
    playlistVideoRemove(video){
      return this.get('onPlaylistRemoveVideo')(video);
    },
    videoAddToPlaylist(video){
      return this.get('onPlaylistAddVideo')(video);
    },
    videoProvidersChanged(provider, newState){
      this.queryVideos(true);
      this.get('onProviderChanged')(provider,newState);
    }
  }
});
