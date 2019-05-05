import Component from '@ember/component';
import VideoSearchMixin from '../mixins/videos-search-mixin';
import { computed } from '@ember/object';

export default Component.extend(VideoSearchMixin, {
  loadingVideoClass: computed('isLoadingVideo', function () {
    return this.get('isLoadingVideo') ? 'active' : '';
  }),
  didInsertElement(){
    this._super(...arguments);
    this.queryVideos(true);
  },
  actions:{
    scrolledHalfYoutubeVideo() {
      this.set('loadingVideo', true);
      this.queryVideos(false).then(() => {
        this.set('loadingVideo', false);
      });
    },
    triggerSearch() {
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
    }
  }
});
