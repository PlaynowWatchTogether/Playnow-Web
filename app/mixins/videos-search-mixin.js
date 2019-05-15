import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import YoutubeSearch from './videos-search-youtube-mixin';
// import {Promise} from 'rsvp';
import { debug } from '@ember/debug';
import { get } from '@ember/object';
import moment from 'moment';
import SearchVideoResult from '../custom-objects/search-video-result';
import $ from 'jquery';
export default Mixin.create(YoutubeSearch, {
  crunchyrollAuth: service(),
  khanAuth: service(),
  resetVideoSearch(){
    this.set('searchQueryVideo', '');
    this.set('searchQueryMusic', '');
    this.resetYoutubeSearch();
  },
  anyProvider(){
    const providers = this.get('videoProviders')||{};
    return providers.youtube || providers.crunchyroll || providers.khan;
  },
  prepareData(rawData){
    return $.map(rawData, (elem)=>{
      return SearchVideoResult.create({data: elem});
    }).sort((a,b)=>{
      return moment(get(b,'createdAt')).unix() - moment(get(a,'createdAt')).unix();
    });
  },
  queryVideos(reset){
    return new Promise((resolve, reject)=>{
      if (reset) {
        this.set('isLoadingVideo', true);
        this.set('youtubeVideoItems', []);
      }
      const sources = [];
      const providers = this.get('videoProviders')||{};
      const searchQuery = this.get('searchQueryVideo');
      if (this.anyProvider()){
        if (providers.khan){
          sources.push(this.khanAuth.query(searchQuery, reset));
        }
        if (providers.youtube){
          sources.push(this.queryYoutubeVideos(reset));
        }
        if (providers.crunchyroll){
          sources.push(this.crunchyrollAuth.query(searchQuery, reset));
        }
      }else{
        sources.push(this.queryYoutubeVideos(reset));
        sources.push(this.crunchyrollAuth.query(searchQuery, reset));
        sources.push(this.khanAuth.query(searchQuery, reset));
      }
      return Promise.all(sources).then((data)=>{
        new Promise((r)=>{
          const wholeData = data.reduce(function(a, b){
            return a.concat(b);
          }, []);
          r(this.prepareData(wholeData));
        }).then((data)=>{
          if (reset) {
            this.set('youtubeVideoItems', data);
          }else{
            this.get('youtubeVideoItems').pushObjects(data);
          }
          this.set('isLoadingVideo',false);
          resolve();
        });

      }).catch(()=>{
        reject();
      });
    });


  },
  queryMusic(reset){
    return this.queryYoutubeMusic(reset);
  }

});
