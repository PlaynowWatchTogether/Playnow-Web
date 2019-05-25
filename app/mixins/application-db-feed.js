import Mixin from '@ember/object/mixin';
import FeedModelWrapper from '../custom-objects/feed-model-wrapper';
export default Mixin.create({
  handleFeedSync(){
    this.get('db').feeds((feeds)=>{
      const ids = feeds.map((elem) => {
        return elem['id'];
      });
      const localRooms = this.store.peekAll('feed-item');
      localRooms.forEach((feed) => {
        if (!ids.includes(feed.get('id'))) {
          feed.unloadRecord();
        }
      });
      feeds.forEach((feed) => {
        feed['rawData'] = JSON.stringify(feed);
        feed['lastUpdate'] = new Date().getUTCMilliseconds();

        let normalizedData = this.store.normalize('feed-item', feed);
        this.store.push(normalizedData);
        const feedWrapper = FeedModelWrapper.create({content: feed});

        const message = feedWrapper.get('lastMessage');
        if (message){
          const localMessage = this.store.normalize('user-feed-message',{
            id: `${feed.id}-${message.uid}`,
            rawData: JSON.stringify({
              isMessage: true,
              message: message
            })
          });
          this.store.push(localMessage);
        }


        const events = feed.Events || {};
        const eventIds = Object.keys(events);
        const localEvents = this.store.peekAll('feed-event').filter((localFeed)=>{
          return localFeed.get('feedId') === feed.id;
        });
        localEvents.forEach((event) => {
          if (!eventIds.includes(event.get('id'))) {
            event.unloadRecord();
          }
        });
        Object.keys(events).forEach((eventKey)=>{
          if (eventKey && 'undefined'!==eventKey){
            const payload = events[eventKey]
            payload.id = eventKey;
            payload.feedId = feed.id;
            const event = {
              id: eventKey,
              feedId: feed.id,
              rawData: JSON.stringify(payload),
              lastUpdate: new Date().getTime()
            }
            let normalizedData = this.store.normalize('feed-event', event);
            this.store.push(normalizedData);
          }
        });
      });
      this.get('db').set('feedUpdated',new Date());
      const contrl = this.controllerFor('application');
      contrl.set('feedLastUpdate', new Date());
      this.handleUserFeedSync();
    })
  }
});
