import Mixin from '@ember/object/mixin';

export default Mixin.create({
  handleUserFeedSync(){
    this.get('db').userFeeds((feeds)=>{
      const lastUpdate = new Date().getTime();
      feeds.forEach((feed) => {
        const payload = {
          id: feed.id,
          createdAt: feed.createdAt,
          type: feed.type,
          feedId: feed.feedId,
          lastUpdate: lastUpdate,
          rawData: JSON.stringify(feed.content)
        }

        let normalizedData = this.store.normalize('user-feed-item', payload);
        this.store.push(normalizedData);
      });
      const contrl = this.controllerFor('application');
      contrl.set('userFeedLastUpdate', new Date());
      this.set('db.userFeedUpdated',new Date().getTime());
    })
  }
});
