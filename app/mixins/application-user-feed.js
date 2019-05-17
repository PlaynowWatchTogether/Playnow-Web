import Mixin from '@ember/object/mixin';

export default Mixin.create({
  handleUserFeedSync(){
    this.get('db').userFeedsOnce((feeds)=>{

      const lastUpdate = new Date().getTime();

      feeds.forEach((feed) => {
        const localFeed = this.store.peekRecord('feed-item', feed.feedId);
        let message = {};
        let event = {};
        if (feed.type === 'message'){
          const messages = localFeed.get('Messages')||{};
          message = messages[feed.content.uid]||{};
        }else if (feed.type === 'event'){
          const localEvent = this.store.peekRecord('feed-event', feed.content.id);
          event = localEvent.get('content');
        }

        const payload = {
          id: feed.id,
          createdAt: feed.createdAt,
          type: feed.type,
          feedId: feed.feedId,
          lastUpdate: lastUpdate,
          rawData: JSON.stringify(feed.content),
          rawLocalFeed: JSON.stringify(localFeed.get('content')),
          rawFeedMessage: JSON.stringify(message),
          rawFeedEvent: JSON.stringify(event)
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
