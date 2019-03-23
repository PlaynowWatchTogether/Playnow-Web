import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  youtubeSearch: service(),
  db: service(),
  init() {
    this._super(...arguments);
    this.queryYoutubeVideos(true);
  },
  queryYoutubeVideos(reset) {
    return new Promise((resolve) => {
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
          resolve();
        });
      }

    });
  },
  actions: {
    triggerSearch() {
      this.set('youtubeVideoItemsPage', null);
      this.queryYoutubeVideos(true);
    },
    scrolledHalfYoutubeVideo() {
      this.set('loadingVideo', true);
      this.queryYoutubeVideos(false).then(() => {
        this.set('loadingVideo', false);
      });
    },
    videoPick(video) {
      this.db.createPublicRoom(video).then(() => {
        this.transitionToRoute('home.chat', this.db.myId(), 'room', {queryParams: {id: video.id}})
      })
    }
  }
});
