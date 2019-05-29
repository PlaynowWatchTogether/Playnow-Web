import Component from '@ember/component';
import VideoSearchMixin from '../mixins/videos-search-mixin';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import {debug} from '@ember/debug';
import { inject as service} from '@ember/service';
export default Component.extend(VideoSearchMixin, {
  khanAuth: service(),
  crunchyrollAuth: service(),
  youtubeSearch: service(),

  loadingVideoClass: computed('isLoadingVideo', function () {
    return this.get('isLoadingVideo') ? 'active' : '';
  }),
  init(){
    this._super(...arguments);
    this.set('videoProviders',{khan: this.khanAuth.get('isLoggedIn'), youtube: this.youtubeSearch.get('isLoggedIn'), crunchyroll: this.crunchyrollAuth.get('isLoggedIn')});
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
      const act = this.get('onProviderChanged');
      if (act){
        act(provider,newState);
      }
    }
  }
});
