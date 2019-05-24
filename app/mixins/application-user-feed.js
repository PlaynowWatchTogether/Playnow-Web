import Mixin from '@ember/object/mixin';

export default Mixin.create({
  handleUserFeedSync(){
    this.get('db').userFeedsOnce((feeds)=>{

      const lastUpdate = new Date().getTime();

      feeds.forEach((feed) => {
        const localFeed = this.store.peekRecord('feed-item', feed.feedId);
        let message = {};
        let event = {};
        let skip = false;
        if (feed.type === 'message'){
          const messages = localFeed.get('Messages')||{};
          message = messages[feed.content.uid]||{};
        }else if (feed.type === 'event'){
          if (feed.content.id){
            const localEvent = this.store.peekRecord('feed-event', feed.content.id);
            if (localEvent!=null){
              event = localEvent.get('content');
            }else{
              skip = true;
            }
          }else{
            skip = true;
          }
        }

        if (!skip){
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
        }else{
          let localFeed = this.store.peekRecord('user-feed-item', feed.id);
          if (localFeed!=null){
            localFeed.unloadRecord();
          }
        }
      });
      const contrl = this.controllerFor('application');
      contrl.set('userFeedLastUpdate', new Date());
      this.set('db.userFeedUpdated',new Date().getTime());
    })
  }
});
