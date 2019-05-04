import Controller from '@ember/controller';
import {debug} from '@ember/debug';
import FeedGroupSource from '../../../custom-objects/feed-group-source';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import MessaginUploadsHandler from '../../../mixins/messaging-uploads-handler';
import MessagingMessageHelper from '../../../mixins/messaging-message-helper';
import MessagingMessagePager from '../../../mixins/messaging-messsage-pager';
import MessageObject from '../../../custom-objects/message-object';

export default Controller.extend(MessaginUploadsHandler, MessagingMessageHelper, MessagingMessagePager, {
  firebaseApp: service(),
  db: service(),
  auth: service(),
  init(){
    this._super(...arguments);
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('dataSource', this, 'dsObserver');
  },
  modelObserver(obj){
    obj.handleModelChange();
  },
  dsObserver(obj){
    obj.handleDSChange();
  },
  messageConvId(){
    return this.dataSource.feedId;
  },
  handleModelChange(){
    debug('feed/show handleModelChange');
    const id = this.get('model.group_id');
    const ds = FeedGroupSource.create({
      db: this.get('db'),
      firebaseApp: this.get('firebaseApp'),
      auth: this.get('auth'),
      feedId: id
    });
    this.set('dataSource', ds);
  },
  isAdmin: computed('feed', function(){
    const myId = this.get('db').myId();
    return this.get('feed.creatorId') === myId;
  }),
  isOwner: computed('feed', function(){
    const myId = this.get('db').myId();
    return this.get('feed.creatorId') === myId;
  }),
  isFollowing: computed('feed', function(){
    const admin = this.get('isAdmin');
    if (admin)
      return true;
    return Object.keys(this.get('feed.Followers')||{}).includes(this.db.myId());
  }),
  isRequestedFollow: computed('feed', function(){
    return Object.keys(this.get('feed.FollowRequests')||{}).includes(this.db.myId());
  }),
  groupAdmins: computed('feed', function(){
    return Object.values(this.get('feed.Admins') || {});
  }),
  isMember: computed('feed', function(){
    const admin = this.get('isAdmin');
    if (admin)
      return true;
    const feed = this.get('feed');
    const myId = this.get('db').myId();
    if (feed){
      return feed.GroupAccess === 1 || Object.keys(feed.Followers||{}).includes(myId);
    }else{
      return false;
    }
  }),
  groupViews:computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      return Object.keys(feed.Followers||{}).length;
    }else{
      return 0;
    }
  }),
  handleDSChange(){
    this.dataSource.listen(this.dataSource.feedId, (feed)=>{
      this.set('feed', feed);
      this.set('lastMessageDate',feed.lastMessageDate);
    });
    this.dataSource.messages(this.dataSource.feedId, (messages)=>{
      const converted = this.convertServerMessagesToUI(messages);
      const wrappedMessages = converted.messages;
      const uiMessages = [];
      wrappedMessages.forEach((mesCntent)=>{

        let normalizedData = this.store.normalize('thread-message', {
          id: mesCntent.id,
          convoId: mesCntent.convId,
          isMessage: mesCntent.isMessage,
          isDate: mesCntent.isDate,
          content: JSON.stringify(mesCntent)
        });

        this.store.push(normalizedData);

        uiMessages.push(MessageObject.create({
          content: mesCntent
        }));
      });
      this.set('blockAutoscroll', false);
      this.set('isLoadingMessages', false);
      this.updateMessages(uiMessages);
    });
  },
  reset(){
    this.dataSource.reset();
    this.set('feed',null);
  },
  performSendPost(){
    const uploads = this.get('uploads');

    this.dataSource.sendPost(this.dataSource.feedId, this.get('messageText')||'',uploads);
    this.resetUploads();
    this.set('messageText', '');
  },
  actions:{
    selectEmoji(emoji){
      let msg = this.get('messageText');

      msg = msg + ' ' + emoji;
      this.set('messageText', msg);
    },
    onMessageEnterPress(){
      this.performSendPost();
    },
    onTextPaste(index, text){
      let m = this.get('messageText');
      let output = [m.slice(0, index), text, m.slice(index)].join('');
      this.set("messageText", output);
    },
    topChildChanged(child){
      let tm = this.get('messageDateTimeout');
      if (tm){
        clearTimeout(tm);
        this.set('messageDateTimeout', null);
      }
      if (child){
        $('.message-scroll-date-holder').show();
        // const ts = $(child).attr('messagets');
        // const mm = moment.unix(ts/1000);
        // $('.message-scroll-date-holder .title').html(mm.format('MM-DD-YYYY'));
        $('.message-scroll-date-holder .title').html($(child).text());
      }else{
        $('.message-scroll-date-holder').hide();
      }
    },
    loadMore() {
      this.set('blockAutoscroll', true);
      this.loadMoreMessages();
    },
    onMessageClick(){

    },
    onPhotoSelect(){

    },
    onReplyTo(){

    },
    willShowCommentsForMessage(show){
      this.set('blockAutoscroll', show);
    },
    postCommentForMessage(message, text){
      this.dataSource.postComment(this.dataSource.feedId,message.id,text);
    },
    onLikeComment(post,comment,liked){
      if (liked){
        this.dataSource.addCommentLike(this.dataSource.feedId,post.uid, comment.uid);
      }else{
        this.dataSource.removeCommentLike(this.dataSource.feedId,post.uid,comment.uid);
      }
    },
    onLikePost(post, liked){
      if (liked){
        this.dataSource.addLike(this.dataSource.feedId,post.uid);
      }else{
        this.dataSource.removeLike(this.dataSource.feedId,post.uid);
      }
    },
    unFollowGroup(){
      const group = this.get('feed');
      this.get('db').unFollowFeedGroup(group.id);
    },
    followGroup(){
      const group = this.get('feed');
      if (group.GroupAccess === 1){
        this.get('db').followFeedGroup(group.id);
      }else{
        this.get('db').requestFollowFeedGroup(group.id);
      }
    },
    enableEdit(){
      this.set('feedTitle', this.get('feed.GroupName'));
      this.set('feedDescription', this.get('feed.GroupDescription'));
      this.set('editFeed', true);
    },
    saveEdit(){
      this.dataSource.updateGroup(this.dataSource.feedId, this.get('feedTitle'), this.get('feedDescription')).then(()=>{
        this.set('editFeed', false);  
      })

    }
  }
});
