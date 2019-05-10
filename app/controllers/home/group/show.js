import Controller from '@ember/controller';
import {debug} from '@ember/debug';
import FeedGroupSource from '../../../custom-objects/feed-group-source';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import MessaginUploadsHandler from '../../../mixins/messaging-uploads-handler';
import MessagingMessageHelper from '../../../mixins/messaging-message-helper';
import MessagingMessagePager from '../../../mixins/messaging-messsage-pager';
import MessageObject from '../../../custom-objects/message-object';
import CreateEventMixin from '../../../mixins/create-event-mixin';
import moment from 'moment';
import { get } from '@ember/object';
import $ from 'jquery';
import FeedModelWrapper from '../../../custom-objects/feed-model-wrapper';
import FeedEventModelWrapper from '../../../custom-objects/feed-event-model-wrapper';
export default Controller.extend(MessaginUploadsHandler, MessagingMessageHelper, MessagingMessagePager, CreateEventMixin, {
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
  messageSortHandler(a,b){
    return get(b,'date').getTime() - get(a,'date').getTime()
  },
  messageConvId(){
    return this.dataSource.feedId;
  },
  membersOnline: computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      return Object.values(get(feed,'videoWatching')||{});
    }else{
      return [];
    }
  }),
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
  currentFeedEvents: computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      return this.store.peekAll('feed-event').filter((elem)=>{
        return elem.get('feedId') === get(feed,'id') && !elem.get('isPast');
      });
    }else{
      return [];
    }
  }),
  pastFeedEvents: computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      return this.store.peekAll('feed-event').filter((elem)=>{
        return elem.get('feedId') === get(feed,'id') && elem.get('isPast');
      });
    }else{
      return [];
    }
  }),
  isAdmin: computed('feed', function(){
    const myId = this.get('db').myId();
    return this.get('feed.creatorId') === myId || Object.keys(this.get('feed.Admins')||{}).includes(this.db.myId());;
  }),
  isOwner: computed('feed', function(){
    const myId = this.get('db').myId();
    return this.get('feed.creatorId') === myId;
  }),
  isFollowing: computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      const myId = this.get('db').myId();
      return feed.isMember(myId);
    }else{
      return false;
    }
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
      return get(feed,'isPublic') || Object.keys(feed.get('Followers')||{}).includes(myId);
    }else{
      return false;
    }
  }),
  groupViews:computed('feed', function(){
    const feed = this.get('feed');
    if (feed){
      return Object.keys(get(feed,'Followers')||{}).length;
    }else{
      return 0;
    }
  }),
  playlistModel: computed('feed', function(){

    const feed = this.get('feed');
    if (feed){
      return {title:`${get(feed,'GroupName')}'s playlist`, videos: Object.values((get(feed,'Playlist') || {}))}
    }else{
      return null;
    }
  }),

  handleDSChange(){
    this.dataSource.listen(this.dataSource.feedId, (feed)=>{
      this.set('feed', FeedModelWrapper.create({content:feed}));
      this.set('lastMessageDate',get(feed,'lastMessageDate'));
    });
    this.dataSource.open(this.dataSource.feedId);
    this.dataSource.messages(this.dataSource.feedId, (messages)=>{
      const converted = this.convertServerMessagesToUI(messages,this.messageConvId(),{skipDate: true});
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
    this.set('editFeed',false);
    this.set('scrolledMore',false);
    this.set('animating',false);
    this.dataSource.reset();
    this.set('feed',null);
  },
  performSendPost(){
    const uploads = this.get('uploads');

    this.dataSource.sendPost(this.dataSource.feedId, this.get('messageText')||'',uploads);
    this.resetUploads();
    this.set('messageText', '');
  },
  timeDropdown: computed(function(){

  }),
  newEventSeatsDropdown:computed(function(){
    const seats = [{id: -1,title:'Unlimited'}];
    let i = 1;
    while (i <= 150) {
      seats.push({title: i, id: i});
      i += 1;
    }
    return seats
  }),
  disableProfilePicChange: computed('isAdmin', function(){
    return !this.get('isAdmin');
  }),
  scaleValue(start,end,scale){
    return start-(scale*(start-end))
  },
  actions:{
    displayAdmins(){
      $('#modalEditAdmins').modal();
    },
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
      this.get('db').unFollowFeedGroup(group.get('id'));
    },
    followGroup(){
      const group = this.get('feed');
      if (group.get('isPublic')){
        this.get('db').followFeedGroup(group.get('id'));
      }else{
        this.get('db').requestFollowFeedGroup(group.get('id'));
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

    },
    videoPick(video){
      if (this.get('isAdmin')){
        debug(JSON.stringify(video));
        this.db.createPublicRoom(video, this.get('feed')).then(()=>{
          this.transitionToRoute('home.chat', this.dataSource.feedId, 'feed')
        });
      }
    },
    playlistVideoAdd(video){
      return this.dataSource.addPlaylistItem(this.dataSource.feedId, video);
    },
    playlistVideoRemove(video){
      return this.dataSource.removePlaylistItem(this.dataSource.feedId, video);
    },
    showCreateEvent(){
      $('#sidebar-tabs .tab-events a').tab('show');
      this.set('showingOneEvent',null);
      this.createEventShowed();
    },
    onLikeEventPost(event, liked){
      if (liked){
        this.dataSource.addEventLike(this.dataSource.feedId,get(event,'id'));
      }else{
        this.dataSource.removeEventLike(this.dataSource.feedId,get(event,'id'));
      }
    },
    onLikeEventComment(event,comment, liked){
      if (liked){
        this.dataSource.addEventCommentLike(this.dataSource.feedId,get(event,'id'), comment.uid);
      }else{
        this.dataSource.removeEventCommentLike(this.dataSource.feedId,get(event,'id'),comment.uid);
      }
    },
    onPostEventComment(event, text){
      this.dataSource.postEventComment(this.dataSource.feedId,get(event,'id'),text);
    },
    onJoinEvent(event){
      this.dataSource.joinEvent(this.dataSource.feedId,get(event,'id'));
    },
    onLeaveEvent(event){
      this.dataSource.leaveEvent(this.dataSource.feedId,get(event,'id'));
    },
    onDeleteEvent(event){
      this.dataSource.deleteEvent(this.dataSource.feedId,get(event,'id')).then(()=>{
        this.set('showingOneEvent',null);
      });
    },
    openEventDetails(event){
      this.resetNewEvent();
      this.set('showingOneEvent',event);
    },
    cancelShowEvent(){
      this.set('showingOneEvent',null);
    },
    updateFeedPic(file){
      let metadata = {
        cacheControl: 'public,max-age=86400'
      };
      let ref = this.firebaseApp.storage().ref('Media/Files/' + this.db.myId() + "/" + this.generateUUID() + '.png');

      ref.put(file.blob, metadata).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.dataSource.updateGroupPic(this.dataSource.feedId, downloadURL);
        });
      });
    },
    addAsAdmin(user){
      return this.dataSource.addUserAdmin(this.dataSource.feedId, user);
    },
    removeAsAdmin(member){
      return this.dataSource.removeUserAdmin(this.dataSource.feedId, member);
    },
    joinLive(){
      this.transitionToRoute('home.chat', this.dataSource.feedId, 'feed');
    },
    onScrollChanged(top){
      const editing = this.get('editFeed');
      const animating = this.get('animating');
      if (!editing && !animating){
        const scale = Math.max(0,Math.min(1,top/289));
        const headerBody = $('.feed-content .feed-header-body');
        const edit = $('.feed-content .feed-header-body .feed-edit');
        const info = $('.feed-content .feed-header-body .feed-info');
        const pic = $('.feed-content .feed-header .feed-pic');
        const picHolder = $('.feed-content .feed-header .feed-pic-holder');
        pic.find('.pic-holder').css({
          'padding': this.scaleValue(5,2,scale)
        });
        pic.css({
          'height':this.scaleValue(150,40,scale),
          'width':this.scaleValue(150,40,scale)
        });
        headerBody.css({
          'padding-bottom':this.scaleValue(10,0,scale),
          'padding-left':this.scaleValue(60,35,scale),
          'background':`rgba(241, 241, 241,${this.scaleValue(0,1,scale)})`
        });
        picHolder.css({
          'height':this.scaleValue(150,45,scale)
        });
        const feedmiddle = $('.feed-content .feed-header .feed-middle');
        feedmiddle.css({
          'padding-top': this.scaleValue(0,4,scale),
          'padding-left': this.scaleValue(20,10,scale)
        });
        const feedEdit = feedmiddle.find('.feed-edit');
        const feedDescription = feedmiddle.find('.feed-description');
        const feedAdmins = feedmiddle.find('.feed-admins-root');
        const header= $('.feed-content .feed-header')
        feedEdit.css({
          'opacity': this.scaleValue(1,0,scale)
        });
        edit.css({
          'opacity': this.scaleValue(1,0,scale),
          'height': this.scaleValue(12,0,scale)
        });
        feedDescription.css({
          'opacity': this.scaleValue(1,0,scale),
          'height': this.scaleValue(65,0,scale),
          'margin-top': this.scaleValue(10,0,scale)
        });
        info.css({
          'opacity': this.scaleValue(1,0,scale),
          'height': this.scaleValue(30,0,scale)
        });
        feedAdmins.css({
          'opacity': this.scaleValue(1,0,scale),
          'height': this.scaleValue(30,0,scale),
          'margin-top': this.scaleValue(10,0,scale)
        });
        header.css({
          'margin-top': this.scaleValue(45,0,scale)
        });

        if (top > 289){
          headerBody.css('box-shadow','#8080802e 0px 4px 4px');
        }else{
          headerBody.css('box-shadow','none');
        }
        // pic.animate({
          // width: 40px;
        // });
        // const old = this.get('scrolledMore')||false;
        // if (old !== top > 25){
        //   this.set('animating', true);
        // }
        // this.set('scrolledMore', top > 25);

      }

    }
  }
});
