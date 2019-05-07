import Mixin from '@ember/object/mixin';

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
        // feed['Followers'] = JSON.stringify(feed.Followers || {});
        // feed['FollowRequests'] = JSON.stringify(feed.FollowRequests || {});
        // feed['Playlist'] = JSON.stringify(feed.Playlist || {});
        // feed['Admins'] = JSON.stringify(feed.Admins || {});
        // feed['videoWatchingContent'] = JSON.stringify(feed.videoWatching || {});

        let normalizedData = this.store.normalize('feed-item', feed);
        this.store.push(normalizedData);

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
          const payload = events[eventKey]
          payload.id = eventKey;
          payload.feedId = feed.id;
          const event = {
            id: eventKey,
            feedId: feed.id,
            content: JSON.stringify(payload)
          }
          let normalizedData = this.store.normalize('feed-event', event);
          this.store.push(normalizedData);
        })
      });
    })
  }
});
