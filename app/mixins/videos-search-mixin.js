import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import YoutubeSearch from './videos-search-youtube-mixin';
export default Mixin.create(YoutubeSearch, {
  resetVideoSearch(){
    this.set('searchQueryVideo', '');
    this.set('searchQueryMusic', '');
    this.resetYoutubeSearch();
  },
  queryVideos(reset){
    return this.queryYoutubeVideos(reset);
  },
  queryMusic(reset){
    return this.queryYoutubeMusic(reset);
  }

});
