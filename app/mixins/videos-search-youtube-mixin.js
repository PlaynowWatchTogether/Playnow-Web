import Mixin from '@ember/object/mixin';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';

export default Mixin.create({
  youtubeSearch: service(),
  resetYoutubeSearch(){
    this.set('youtubeVideoItemsPage', null);
    this.set('youtubeMusicItemsPage', null);
  },
  queryYoutubeMusic(reset) {
    return new Promise((resolve) => {
      let q = this.get('searchQueryMusic');
      let page = this.get('youtubeMusicItemsPage');
      if (reset) {
        this.set('youtubeMusicItemsPage', null);
        this.set('isLoadingMusic', true);
      }
      if (reset) {
        this.set('youtubeMusicItems', []);
      }
      if (!q || q.length === 0) {
        this.get('youtubeSearch').trending(true, page).then((data) => {
          this.set('youtubeMusicItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeMusicItems', data.items);
          } else {
            this.get('youtubeMusicItems').pushObjects(data.items);
          }
          this.set('isLoadingMusic', false);
          resolve();
        });
      } else {
        this.get('youtubeSearch').search(q, true, page).then((data) => {
          this.set('youtubeMusicItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeMusicItems', data.items);
          } else {
            this.get('youtubeMusicItems').pushObjects(data.items);
          }
          this.set('isLoadingMusic', false);
          resolve();
        });
      }

    });
  },
  queryYoutubeVideos(reset) {
    return new Promise((resolve) => {
      if (reset) {
        this.set('youtubeVideoItemsPage',null);
        this.set('isLoadingVideo', true);
      }
      let q = this.get('searchQueryVideo');
      let page = this.get('youtubeVideoItemsPage');
      if (reset) {
        this.set('youtubeVideoItems', []);
      }
      if (!q || q.length === 0) {
        this.get('youtubeSearch').trending(false, page).then((data) => {
          this.set('youtubeVideoItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeVideoItems', data.items);
          } else {
            this.get('youtubeVideoItems').pushObjects(data.items);
          }
          this.set('isLoadingVideo', false);
          resolve();
        });
      } else {
        this.get('youtubeSearch').search(q, false, page).then((data) => {
          this.set('youtubeVideoItemsPage', data.nextPage);
          if (reset) {
            this.set('youtubeVideoItems', data.items);
          } else {
            this.get('youtubeVideoItems').pushObjects(data.items);
          }
          this.set('isLoadingVideo', false);
          resolve();
        });
      }

    });
  }
});
