import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import FeedGroupSource from '../../custom-objects/feed-group-source';
import { get } from '@ember/object';

export default Mixin.create({
  db: service(),
  firebaseApp: service(),
  auth: service(),
  actions: {
    followGroup(group){
      if (group.get('isPublic')){
        return this.get('db').followFeedGroup(get(group,'id'));
      }else{
        return this.get('db').requestFollowFeedGroup(get(group,'id'));
      }
    },
    unFollowGroup(group){
      this.get('db').unFollowFeedGroup(get(group,'id'));
    },
    onJoinEvent(group, event){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });

      ds.joinEvent(get(group,'id'),get(event,'id'));
    },
    onLeaveEvent(group, event){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      ds.leaveEvent(get(group,'id'),get(event,'id'));
    },
    postCommentForMessage(group,message, text){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      ds.postComment(ds.feedId,get(message,'uid'),text);
    },
    onPostEventComment(group,event, text){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      ds.postEventComment(ds.feedId,get(event,'id'),text);
    },
    onLikeComment(group,post,comment,liked){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      if (liked){
        ds.addCommentLike(ds.feedId,post.uid, comment.uid);
      }else{
        ds.removeCommentLike(ds.feedId,post.uid,comment.uid);
      }
    },
    onLikePost(group,post, liked){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      if (liked){
        ds.addLike(ds.feedId,post.uid);
      }else{
        ds.removeLike(ds.feedId,post.uid);
      }
    },
    onLikeEventPost(group,event, liked){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      if (liked){
        ds.addEventLike(ds.feedId,get(event,'id'));
      }else{
        ds.removeEventLike(ds.feedId,get(event,'id'));
      }
    },
    onLikeEventComment(group,event,comment, liked){
      const ds = FeedGroupSource.create({
        db: this.get('db'),
        firebaseApp: this.get('firebaseApp'),
        auth: this.get('auth'),
        feedId: get(group,'id')
      });
      if (liked){
        ds.addEventCommentLike(ds.feedId,get(event,'id'), comment.uid);
      }else{
        ds.removeEventCommentLike(ds.feedId,get(event,'id'),comment.uid);
      }
    },
  }
});
