import Controller from '@ember/controller';
import MessageDataSource from '../../custom-objects/message-data-source';
import VideoStateHandler from '../../custom-objects/video-state-handler';
import PicturedObject from '../../custom-objects/pictured-object';
import SearchVideoResult from '../../custom-objects/search-video-result';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {run} from '@ember/runloop';
import {debug} from "@ember/debug";
import $ from 'jquery';
import moment from 'moment';
import MessageObject from '../../custom-objects/message-object';
import {Promise} from 'rsvp';
import { get, set } from '@ember/object';
import MessagingUploadsHandler from '../../mixins/messaging-uploads-handler';
import MessagingMessageHelper from '../../mixins/messaging-message-helper';
import MessagingMessagePager from '../../mixins/messaging-messsage-pager';
import VideoSearchMixin from '../../mixins/videos-search-mixin';
import ChatModelHelper from '../../mixins/chat-model-helper';
import BroadcastStreamer from '../../custom-objects/broadcast-streamer';
import ObjectProxy from '@ember/object/proxy';
import ArrayProxy from '@ember/array/proxy';
import FeedModelWrapper from '../../custom-objects/feed-model-wrapper';
import {Subject, BehaviorSubject, interval} from 'rxjs';
import {debounce} from 'rxjs/operators';
import {timer} from 'rxjs';
import {htmlSafe} from '@ember/template'
export default Controller.extend(MessagingUploadsHandler, MessagingMessageHelper, MessagingMessagePager,VideoSearchMixin, ChatModelHelper, {
  firebaseApp: service(),
  db: service(),
  auth: service(),
  ntp: service(),
  gcmManager: service(),
  queryParams: ['id'],
  id: null,
  init() {
    this._super(...arguments);
    this.chatModel = {};
    this.messageText = '';
    this.composeChips = [];
    this.memberColors={};
    this.controlHideSubject = new Subject();
    this.controlHideSubject.pipe(debounce(() => interval(3000))).subscribe({
      next: () => {
        if ($('body').hasClass('fullscreen-video') && !$('.messages-holder-full').hasClass('mouse-on') && !$('.messageContent').is(":focus")){
          $('.messages-holder-full').fadeOut();
        }
      }
    });

    this.chatMembersArray = ObjectProxy.create({content:{
      my: ObjectProxy.create({content:null}),
      remote: ArrayProxy.create({content:[]})
    }});
    this.streamer = BroadcastStreamer.create({
      streamPublished: (streamId)=>{
        const ds = this.get('dataSource');
        ds.publishStream(streamId, this.get('streamingModel'));
      },
      streamRemoved:(streamId)=>{
        const ds = this.get('dataSource');
        ds.removeStream(streamId);
      }
    });
    this.set('streamingModel',{
      mic: false,
      video: false
    })
    this.videoStateHandler = VideoStateHandler.create({
      ntp: this.get('ntp'),
      delegate: {
        loadVideo: (video, seconds) => {
          run(() => {
            const oldValue = this.get('hasPlayer');
            let holder = $('#youtubePlaceHolder');
            let height = 9 * holder.width() / 16;
            holder.height(height);

            $('#youtubePlaceHolder').show();

            if (oldValue){
              this.set('hasPlayer', false);
              this.set('playerReady',false);
              this.set('playerAction', 0);
              this.set('playerVideo', {});
              this.set('videoPlayerState',1);
              setTimeout(()=>{
                this.set('hasPlayer', true);
                // this.set('refreshScroll',new Date());
                this.set('playerAction', 0);
                this.set('playerVideo', {video: video, seconds: seconds});
                if (get(video,'videoType') === 'youtube#music'){
                  this.set('videoPlayerState',0);
                }else{
                  this.set('videoPlayerState',1);
                }
                this.set('youtube#video')
              },1000);
            }else{
              this.set('hasPlayer', true);
              // this.set('refreshScroll',new Date());
              this.set('playerAction', 0);
              this.set('playerVideo', {video: video, seconds: seconds});
              if (get(video,'videoType') === 'youtube#music'){
                this.set('videoPlayerState',0);
              }else{
                this.set('videoPlayerState',1);
              }
            }
          });
        },
        updateState: (state, seconds = 0, syncAt = null) => {
          run(() => {
            let ds = this.get('dataSource');
            ds.updateWatchState(state, seconds, syncAt);
          });
        },
        playVideo: () => {
          run(() => {
            this.set('playerAction', 1);
          });
        },
        updateWatching: (videoId, state) => {
          run(() => {
            let ds = this.get('dataSource');
            ds.updateWatching(videoId, state);
          });
        },
        seekVideo: (seconds) => {
          run(() => {
            this.set('playerSeconds', seconds);
            this.set('playerAction', 5);
          });
        },
        slideVideo: () => {
          run(() => {
            this.set('playerAction', 2);
            let ds = this.get('dataSource');
            ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
          });
        },
        play: () => {
          run(() => {
            this.set('playerAction', 3);
          });
        },
        pause: () => {
          run(() => {
            this.set('playerAction', 4);
          });
        }
      }
    });
    this.addObserver('model', this, 'modelObserver');
    this.addObserver('dataSource', this, 'dataSourceObserver');
    this.addObserver('messageText', this, 'messageTextObserver');
    this.addObserver('searchMode', this, 'searchModeObserver');
    this.searchModeObserver(this);
    this.set('playerState', null);
    this.set('searchMode', 'video');

    // this.queryVideos(true);
    this.queryMusic(true);
    $('body').on('click','.messages-holder-full',(event)=>{
      $('.ember-content-editable.messageContent').focus();
    });
  },
  displayWatchers: computed('hasPlayer','playerReady', function(){
    const hasPlayer = this.get('hasPlayer');
    const ready = this.get('playerReady');
    return hasPlayer && ready;

  }),
  localStreamId(){
    const ds = this.get('dataSource');
    if (ds){
      const dsConv = ds.convId();
      const type = this.get('model.type');
      const id = this.get('db').myId();
      return `${new Date().getTime()}-${id}-${dsConv}`;
    }else{
      return null;
    }
  },
  messageConvId(){
    const dsConv = this.get('dataSource').convId();
    const type = this.get('model.type');
    return `${dsConv}-${type}`;
  },
  isGroup: computed('model', function(){
    return this.get('model.type') === 'group';
  }),
  isCompose: computed('model', function () {
    return this.get('model.chat_id') === 'compose'
  }),
  loadingVideoClass: computed('isLoadingVideo', function () {
    return this.get('isLoadingVideo') ? 'active' : '';
  }),
  loadingMusicClass: computed('isLoadingMusic', function () {
    return this.get('isLoadingMusic') ? 'active' : '';
  }),
  isRoom: computed('model', function () {
    return this.isTypePublicRoom(this.get('model.type'));
  }),
  playerLoadingClass: computed('playerState', function () {
    let l = this.get('playerState');
    if (l) {
      if (l.buffering)
        return true;
      if (!l.playing)
        return true;
    }
    return false;
  }),
  loadingOverlayClass: computed('playerState', function () {
    debug(JSON.stringify(this.get('playerState')));
    return 'loading'
  }),
  watchersClass: computed('playerState','videoPlayerState', function () {
    let l = this.get('playerState');
    const videoState = this.get('videoPlayerState');
    const classes = [];
    if (l) {
      if (l.buffering){
        classes.push('loading');
      }else if (!l.playing)
        classes.push('loading');
    }
    if (videoState === 0){
      classes.push('state-collapsed');
    }
    return classes.join(' ');
  }),

  messageTextObserver: (obj) => {
    debug('typing ' + obj.get('messageText'));
    let ds = obj.get('dataSource');
    if (ds) {
      ds.typing(obj.get('messageText'));
    }
  },
  isNotOne2One: computed('model', function(){
    let type = this.get('model').type;
    return type!=='one2one';
  }),
  isOne2One: computed('model', function(){
    let type = this.get('model').type;
    return type ==='one2one';
  }),
  displayName(friend) {

    let username = friend.get('Username');
    let firstName = friend.get('firstName');
    let lastName = friend.get('lastName');

    if (!username) {
      return [firstName, lastName].join(" ");
    }

    if (username.includes('@')) {
      return username.split('@')[0];
    }

    return username;
  },
  modelObserver: (obj) => {
    $(document).on('mousemove', () => {
      run(() => {
        $('.messages-holder-full').fadeIn();
        obj.controlHideSubject.next(1);
      });
    });
    $(document).on('mouseenter','.messages-holder-full', (event) => {
      run(() => {
        $('.messages-holder-full').addClass('mouse-on');
      });
    });
    $(document).on('mouseleave','.messages-holder-full', (event) => {
      run(() => {
        $('.messages-holder-full').removeClass('mouse-on');
      });
    });

    $(document).on('keyup.chat',(event)=>{
      if (27 === event.keyCode){
        if (obj.get('isFullScreen')){
          obj.closeFullScreen();
          return;
        }
        if (obj.get('displayEmoji')){
          obj.set('displayEmoji',false);
          return;
        }
        if (obj.get('inReplyTo')){
          obj.set('inReplyTo',null);
          return;
        }
        obj.transitionToRoute('home');
      }
      debug('key up');
    });
    const myId = obj.get('db').myId();
    let type = obj.get('model').type;
    let convId = obj.get('model').chat_id;
    obj.videoStateHandler.myId = obj.firebaseApp.auth().currentUser.uid;
    obj.set('isChatOnline', false);
    obj.set('onlineText', '');
    if ('compose' === convId) {
      obj.set('chatModel', {
        hasProfilePic: false,
        title: 'Compose message'
      });
      return;
    }

    if ('one2one' === type) {

      obj.get('db').friend(convId).then((friend) => {
        obj.set('chatModel', {
          hasProfilePic: true,
          title: obj.displayName(friend),
          ProfilePic: friend.get('ProfilePic'),
          user: friend
        });
        obj.set('dataSource', MessageDataSource.create({
          gcmManager: obj.gcmManager,
          type: 'one2one',
          user: friend,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database(),
          fb: obj.firebaseApp,
          auth: obj.auth
        }));

        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = obj.isTypePublicRoom(type) ? 'sliding' : 'awaiting';
        obj.get('db').profileObserver(convId, (profile) => {
          obj.set('isChatOnline', true);
          if (profile['Last Active Date'] === 'online') {
            obj.set('onlineText', 'online');
          } else {
            obj.set('onlineText', moment.unix(profile['Last Active Date']).fromNow());
          }
          debug('one2one profile updated');
        })
      }).catch((error)=>{
        obj.transitionToRoute('home');
      });
    } else if (obj.isTypePublicRoom(type)) {
      if (type === 'room'){
        obj.store.find('room', convId).then((room) => {
          obj.set('chatModel', {
            hasProfilePic: false,
            title: '@' + room.get('creatorName') + "' room",
            room: room
          });
          obj.set('dataSource', MessageDataSource.create({
            type: type,
            gcmManager: obj.gcmManager,
            room: room,
            myId: obj.firebaseApp.auth().currentUser.uid,
            db: obj.firebaseApp.database(),
            fb: obj.firebaseApp,
            auth: obj.auth
          }));

          obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
          obj.videoStateHandler.syncMode = obj.isTypePublicRoom(type) ? 'sliding' : 'awaiting';

        });
      }else if (type === 'feed'){
        obj.db.feed(convId).then((remoteFeed)=>{

            const feed = FeedModelWrapper.create({content:remoteFeed})
            const isAdmin = feed.isAdmin(myId);
            obj.set('chatModel', {
              hasProfilePic: true,
              title: htmlSafe('<span>Live</span> @' + feed.get('GroupName')),
              ProfilePic: feed.get('ProfilePic'),
              feed: feed,
              isAdmin: isAdmin
            });
            obj.set('dataSource', MessageDataSource.create({
              type: type,
              gcmManager: obj.gcmManager,
              feed: feed,
              myId: obj.firebaseApp.auth().currentUser.uid,
              db: obj.firebaseApp.database(),
              fb: obj.firebaseApp,
              auth: obj.auth
            }));


            obj.videoStateHandler.isMaster = feed.get('videoState.senderId') === obj.firebaseApp.auth().currentUser.uid;
            obj.videoStateHandler.syncMode = obj.isTypePublicRoom(type) ? 'sliding' : 'awaiting';

            obj.db.live(convId).then((live)=>{
                debug(`Got live ${live}`);
                if (!live.videoState){
                  obj.transitionToRoute('home.group.show',{group_id: get(remoteFeed,'id')});
                }
            }).catch((error)=>{
              obj.transitionToRoute('home.group.show',{group_id: get(remoteFeed,'id')});
            })

        }).catch((error)=>{
          obj.transitionToRoute('home');
        });
      }
    } else if ('group' === type) {
      obj.db.group(convId).then((group) => {
        obj.set('chatModel', {
          hasProfilePic:  profilePic!=null && profilePic.length > 0,
          ProfilePic: profilePic,
          title: get(group,'GroupName'),
          group: group
        });
        obj.set('dataSource', MessageDataSource.create({
          type: 'group',
          gcmManager: obj.gcmManager,
          group: group,
          myId: obj.firebaseApp.auth().currentUser.uid,
          db: obj.firebaseApp.database(),
          fb: obj.firebaseApp,
          auth: obj.auth
        }));
        let profilePic = get(group,'ProfilePic');


        obj.videoStateHandler.isMaster = obj.get('dataSource').convId() === obj.firebaseApp.auth().currentUser.uid;
        obj.videoStateHandler.syncMode = 'room' === type ? 'sliding' : 'awaiting';
        obj.offGroupListen();
        obj.set('listenGroup',obj.get('db').listenGroup(convId, (snapshot)=>{
          let profilePic = snapshot.ProfilePic;

          obj.set('chatModel.hasProfilePic', profilePic!=null && profilePic.length > 0);
          obj.set('chatModel.ProfilePic', profilePic);
          obj.set('chatModel.title', snapshot.GroupName);
          obj.set('chatModel.group', group);
        }));
      }).catch((error)=>{
        obj.transitionToRoute('home');
      });;

    } else {
      obj.transitionToRoute('home');
    }


  },
  sliderClass: computed('videoStateHandler', 'dataSource', function () {
    let vsh = this.get('videoStateHandler');
    let ds = this.get('dataSource');
    if (vsh && ds) {
      if (vsh.isMaster || vsh.syncMode === 'awaiting') {
        return '';
      } else {
        return 'not-responsive'
      }
    } else {
      return 'not-responsive'
    }
  }),
  dataSourceObserver: (obj) => {
    let ds = obj.get('dataSource');
    ds.updateWatching('', 'closed');
    let one_day = 1000 * 60 * 60 * 24;
    ds.loadPlaylist((playlist)=>{
      const items = $.map(Object.values(playlist), (elem)=>{
        return SearchVideoResult.create({data: elem});
      })
      obj.set('chatModel.Playlist', items);
    });
    ds.videoWatchers((watchers) => {
      if (watchers) {
        obj.set('allWatchers', watchers);
        obj.videoStateHandler.updateWatchers(watchers, 0);
        let watcherProfiles = [];
        let allWatcherProfiles = [];
        watchers.forEach((elem) => {
          if (elem['state'] !== 'closed') {
            watcherProfiles.push(obj.db.profile(elem['userId']))
          }
          allWatcherProfiles.push(obj.db.profile(elem['userId']))
        });
        Promise.all(watcherProfiles).then((profiles) => {
          let senders = [];
          let others = [];
          let sender = obj.get('videoStateHandler').lastState.senderId;
          profiles.forEach((item) => {
            if (sender === item['id']) {
              senders.push(item);
            } else {
              others.push(item)
            }
          });
          obj.set('watchers', senders.concat(others));
        })
        Promise.all(allWatcherProfiles);
      }
    });
    ds.videoState((vs) => {
      if (vs) {
        run(() => {
          if (ds.feed){
            obj.videoStateHandler.isMaster = get(vs,'senderId') === obj.firebaseApp.auth().currentUser.uid;
          }
          obj.videoStateHandler.handleVideoState(vs);
        });
      }
    });
    ds.lastMessageSeen((lastSeen) => {
      if (ds.type === 'one2one') {
        obj.set('lastSeenMessage', lastSeen);
        // const localMessages = obj.get('remoteMessages')||[];
        // obj.updateRemoteMessages(localMessages);
      }
    });
    ds.members((members) => {
      obj.set('members', members);

    });
    ds.membersOnce().then((onceMembers)=>{
      obj.set('onceMembers',onceMembers);
      ds.messagesOnce((messages) => {
        obj.updateRemoteMessages(messages);
        const lastObj = (messages.lastObject||{serverDate:0});
        const lastDate = lastObj.serverDate || lastObj.date
        ds.messageAdded(lastDate+1,(newMessage)=>{
          debug(`new message ${JSON.stringify(newMessage)}`);

           if (newMessage.senderId !== obj.get('db').myId()){
            newMessage.id = newMessage.uid;
            const localMessages = obj.get('remoteMessages');
            localMessages.pushObject(newMessage);
            obj.updateRemoteMessages(localMessages);
           }
        })
        ds.messageChanged((newMessage)=>{
          const localMessages = obj.get('remoteMessages');
          const exists = localMessages.find((elem)=>{
            return get(elem,'uid') === get(newMessage,'uid');
          });

          if (exists){
            exists.isLocal = false;
            Object.assign(exists,newMessage)
          }else{

          }
          obj.updateRemoteMessages(localMessages);
          debug(`message changed ${JSON.stringify(newMessage)}`);


        })
      });
    });
    ds.typingIndicator((indicator) => {
      let myId = obj.get('db').myId();
      let filtered = indicator.filter((elem) => {
        return elem.userId !== myId;
      });
      obj.set('typingIndicator', filtered);
    });
    obj.set('isLoadingMessages', true);
    if (obj.get('messageToSend') && obj.get('dataSource')) {
      obj.get('dataSource').sendMessage(obj.get('messageToSend'));
      obj.set('messageToSend', null);
    }
    ds.streamListen((streams)=>{
      const myId = obj.get('db').myId();
      const remoteStreams = obj.get('remoteStreams')||ArrayProxy.create({content: []});
      streams.forEach((stream)=>{
        if (stream.userId!==myId){
          let findLocal = null;
          remoteStreams.forEach((localStream)=>{
            if (get(localStream,'userId') === get(stream,'userId')){
              findLocal = localStream;
            }
          });
          if (findLocal){
              set(findLocal,'content',stream);
          }else{
            remoteStreams.pushObject(ObjectProxy.create({content:stream}));
          }
        }
      });
      remoteStreams.forEach((localStream)=>{
        let findRemote = false;
        streams.forEach((remoteStream)=>{
          if (get(localStream,'userId') === get(remoteStream,'userId')){
            findRemote = localStream;
          }
        });
        if (!findRemote){
          remoteStreams.removeObject(localStream)
        }
      })
      obj.set('remoteStreams',remoteStreams);

    });


    let pauseAction = () => {
      run(function () {
        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('pause', window.globalPlayer.getCurrentTime());
        }
      });
    };
    let playAction = () => {
      run(function () {

        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', window.globalPlayer.getCurrentTime());
        }
      });
    };
    let closeAction = () => {
      run(function () {
        obj.closeVideo()
      });
    };
    let body = $('body');
    body.on('click', '#youtubeHolder .pause-control', () => {
      let state = $('#youtubeHolder .controlsOverlay').attr('play-state');
      if (state === '1') {
        pauseAction();
      } else if (state === '2') {
        playAction();
      }
    });
    body.on('click', '.youtube-music-holder .controls .play-btn', playAction);
    body.on('click', '.youtube-music-holder .controls .pause-btn', pauseAction);
    body.on('click', '.youtube-music-holder .controls .close-btn', closeAction);
    // let holder = $('#youtubeHolder');
    body.on('click', '#youtubeHolder .controlsOverlay .pause-action', pauseAction);
    body.on('click', '#youtubeHolder .controlsOverlay .play-action', playAction);
    body.on('click', '#youtubeHolder .controlsOverlay .close', closeAction);

    let slideChange = (event) => {
      run(function () {
        debug('slider changed');
        let vsh = obj.get('videoStateHandler');
        let ds = obj.get('dataSource');
        if (vsh.isMaster || vsh.syncMode === 'awaiting') {
          ds.updateWatchState('slide', parseFloat($(event.target).val()));
        }
        obj.set('slidingProgress', 0);

      });
    };
    let slideInput = () => {
      run(function () {

        obj.set('slidingProgress', new Date().getTime());
      });
    };

    body.on('change', '.youtube-music-holder  .slider', slideChange);
    body.on('input', '.youtube-music-holder  .slider', slideInput);
    body.on('change', '.controlsOverlay .slider', slideChange);
    body.on('input', '.controlsOverlay .slider', slideInput);
    if (obj.get('id')) {
      obj.get('youtubeSearch').video(obj.get('id')).then((video) => {
        obj.shareVideo(video);
      });
      debug('got video in path ' + obj.get('id'));
    }
  },
  displayVideoRequest: computed('canSendVideo', function(){
    return !this.get('canSendVideo');
  }),
  canSendVideo:computed('dataSource','model','feed', function(){
    let ds = this.get('dataSource');
    let type = this.get('model').type;
    if (ds) {
      if (type==='feed'){
        return ds.feed.isAdmin(this.firebaseApp.auth().currentUser.uid);
      }else{
        return this.get('isMaster');
      }
    } else
      return false;
  }),
  isMaster: computed('dataSource', function () {
    let ds = this.get('dataSource');
    let type = this.get('model').type;
    if (ds) {
      if (type==='feed'){
        return ds.feed.get('videoState.senderId') === this.firebaseApp.auth().currentUser.uid;
      }else{
        return ds.convId() === this.firebaseApp.auth().currentUser.uid || type !== 'room';// TODO:  fix
      }
    } else
      return false;
  }),
  convId: computed('dataSource', function () {
    let ds = this.get('dataSource');
    if (ds) {
      return ds.convId();
    } else {
      return '';
    }
  }),
  canPerformSend: computed('messageText', 'uploads.@each.state', function(){
    var hasUnloadedUploads = false;
    const hasText = this.get('messageText').length > 0;
    const hasAttachments = this.get('uploads').length > 0;

    this.get('uploads').forEach((elem)=>{
      if (elem.state !== 2){
        hasUnloadedUploads = true;
      }
    });
    return (hasText && hasAttachments && !hasUnloadedUploads) || (hasText && !hasAttachments) || (!hasText && hasAttachments && !hasUnloadedUploads)

  }),
  chatActionSendClass: computed('canPerformSend', function(){
    const enabled = this.get('canPerformSend');
    return enabled ? '' : 'disabled';
  }),
  offGroupListen(){
    const groupListern = this.get('listenGroup');
    if (groupListern){
      this.get('db').offListenGroup(groupListern);
      this.set('listenGroup',null);
    }
  },
  playlistModel: computed('chatModel.Playlist', function(){

    const chat = this.get('chatModel');
    const playlist = get(chat,'Playlist')
    if (playlist){
      let title = 'Playlist';
      if (this.get('model.type') === 'one2one' || this.get('model.type') === 'group'){
        title = 'Our Playlist';
      }
      if (this.get('model.type') === 'feed'){
        title = `${get(chat,'feed.GroupName')}'s playlist`;
      }
      return {title:title, videos: Object.values(playlist || {})}
    }else{
      return null;
    }
  }),
  streamerHolderSelector(){
    return '.streamer-holder .local-stream .member.local .video-holder';
  },
  reset() {
    if (!this.get('isCompose')){
      const localStreamId = this.localStreamId();
      if (localStreamId){
        this.set('playerReady',false);
        this.set('streamingModel.mic',false);
        this.set('streamingModel.video',false);
        this.streamer.startStreaming(this.streamerHolderSelector(), this.localStreamId(),this.get('streamingModel'), this.get('db').myId());
      }
    }

    this.closeFullScreen();
    $(document).off("keyup.chat");
    this.set('displayEmoji',false);
    this.offGroupListen();
    this.set('inReplyTo', null);
    this.set('id', null);
    this.resetUploads();
    this.resetVideoSearch();
    this.set('messageText', '');
    this.set('playerVideo', null);
    this.set('composeChips', []);
    this.set('chatModel', {});

    this.set('searchMode', 'video');
    this.set('isLoadingMessages', false);
    // this.queryVideos(true);
    this.queryMusic(true);

    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.removeWatching();
      ds.removeStream(this.localStreamId());
      ds.stop()
    }
    this.set('hasPlayer', false);
    let vsh = this.get('videoStateHandler');
    if (vsh) {
      vsh.closeVideo();
    }

    this.resetMessages();
  },

  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  searchModeObserver: () => {

  },
  updateRemoteMessages(messages){
    const ds = this.get('dataSource');
    const lastSeenMessage = this.get('lastSeenMessage');
    const converted = this.convertServerMessagesToUI(messages,this.messageConvId(),{}, lastSeenMessage);
    const wrappedMessages = converted.messages;
    const lastRecord = converted.lastRecord;
    const uiMessages = [];
    const myId = this.get('db').myId();
    if (lastRecord && !lastRecord.isLocal){
      ds.sendSeen(lastRecord.uid);
    }

    const type = this.get('model.type');
    wrappedMessages.forEach((mesCntent)=>{
      let isSeen = false;
      let receiverId = '';

      if (mesCntent.isMessage){
        if (ds.type === 'one2one') {
          if (mesCntent.message.senderId === myId && mesCntent.message.seen){
            isSeen = mesCntent.message.seen[get(ds.user,'id')];
          }
          receiverId = get(ds.user,'id');
          // const onceMembers = this.get('onceMembers');
        }
      }
      let normalizedData = this.store.normalize('thread-message', {
        id: mesCntent.id,
        convoId: mesCntent.convId,
        isMessage: mesCntent.isMessage,
        mine: mesCntent.message.senderId===myId,
        isDate: mesCntent.isDate,
        displaySender:mesCntent.displaySender,
        messageIndex: mesCntent.messageIndex,
        maxIndex: mesCntent.maxIndex,
        isSeen: isSeen,
        isLocal: mesCntent.isLocal,
        receiverId: receiverId,
        rawData: JSON.stringify(mesCntent)
      });

      this.store.push(normalizedData);
      if (mesCntent.isMessage && !mesCntent.message.isLocal){
        ds.messageSeen(mesCntent.message.uid);
      }
      uiMessages.push(MessageObject.create({
        content: mesCntent
      }));
    })
    this.set('remoteMessages', messages);
    this.set('blockAutoscroll', false);
    this.set('isLoadingMessages', false);
    this.updateMessages(uiMessages);
    debug('Updated remote messages');

  },
  closeVideo() {
    this.closeFullScreen();
    let vsh = this.get('videoStateHandler');
    this.set('hasPlayer', false);
    vsh.closeVideo();
    this.set('playerVideo', null);
    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.updateWatching('', 'closed');
    }
    window.globalPlayer=null;
  },
  modeClass: computed('model', function () {
    if (this.isTypePublicRoom(this.get('model.type'))){
      return 'room'
    }else{
      return this.get('model').type;
    }
  }),
  videoTabClass: computed('searchMode', function () {
    return this.get('searchMode') === 'video' ? 'active' : '';
  }),
  songsTabClass: computed('searchMode', function () {
    return this.get('searchMode') === 'music' ? 'active' : '';
  }),
  isMusicResult: computed('searchMode', function () {
    return this.get('searchMode') === 'music'
  }),
  myID: computed('model', function () {
    return this.get('db').myId();
  }),
  isMinimized: computed('videoPlayerState', function(){
    return this.get('videoPlayerState') === 0;
  }),
  chatMembers: computed('allWatchers','isFullScreen','remoteStreams.@each.{mic,video,stream}','streamingModel.mic','streamingModel.video',function(){
    const myId = this.get('db').myId();
    const remote = [];
    let local = null;

    (this.get('allWatchers')||[]).forEach((elem)=>{
      if (get(elem,'userId') === myId){
        local = elem;
        set(local,'streaming',this.get('streamingModel'));
      }else{
        let remoteStream = null;
        set(elem,'streaming',null);
        (this.get('remoteStreams')||[]).forEach((stream)=>{
          if (get(stream,'userId') === get(elem,'userId')){
            set(elem,'streaming',stream);
          }
        });
        remote.push(elem);
      }
    });

    this.get('chatMembersArray.content.remote').forEach((localElem)=>{
      let foundLocal = null;
      remote.forEach((elem)=>{
        if (get(elem,'userId') === get(localElem,'userId')){
          foundLocal = elem;
        }
      });
      if (foundLocal){
        localElem.set('content',foundLocal);
      }else{
        this.get('chatMembersArray.content.remote').removeObject(localElem);
      }
    });

    remote.forEach((elem)=>{
      let foundLocal = null;
      this.get('chatMembersArray.content.remote').forEach((localElem)=>{
        if (get(elem,'userId') === get(localElem,'userId')){
          foundLocal = elem;
        }
      });
      if (!foundLocal){
        this.get('chatMembersArray.content.remote').pushObject(ObjectProxy.create({content:elem}));
      }
    });
    // this.get('chatMembersArray').set('content.remote', remote);
    this.get('chatMembersArray').set('content.my.content', local || {userId: myId});
    return this.get('chatMembersArray');
  }),
  membersProfiles: computed('allWatchers', function () {
    let members = this.get('allWatchers');
    if (members) {
      return members.map((elem, index) => {
        elem.className = 'z' + (members.length - index);
        return PicturedObject.create({content: elem})
      });
    } else {
      return []
    }
  }),
  membersClass: computed('hasPlayer', function () {
    return this.get('hasPlayer') ? 'hidden' : '';
  }),
  videoClass: computed('playerVideo', function () {
    let video = this.get('playerVideo');
    if (video && video.video) {
      return video.video.videoType;
    } else {
      return '';
    }
  }),
  typingIndicatorProfiles: computed('typingIndicator', 'members', function () {
    let members = this.get('members');
    let indicators = this.get('typingIndicator');
    if (members && indicators) {
      let typing = [];
      indicators.forEach((indicator) => {
        if (indicator.messageId) {
          let member = members.find((member) => {
            return member.id === indicator.userId;
          });
          if (member) {
            typing.push(PicturedObject.create({content: member}));
          }

        }
      });
      return typing;
    } else {
      return [];
    }
  }),
  createGroup() {
    return new Promise((resolve, reject) => {
      let db = this.get('db');
      let groupName = '';
      db.profile(db.myId()).then((profile) => {

        let memberNames = [profile['FirstName']].concat(this.get('composeChips').sort((a, b) => {
          a['id'].localeCompare(b['id'])
        }).map((member) => {
          return member['firstName'];
        }));
        groupName = memberNames.join(", ");
        let refName = groupName + "@" + db.myId();
        db.createGroup(groupName, this.get('composeChips')).then(() => {
          this.transitionToRoute('home.chat', refName, 'group');
          resolve(refName)
        }).catch((error) => {
          reject(error);
        });
      });

    });
  },
  composeMessage() {
    let chips = this.get('composeChips');
    if (chips.length === 1) {
      let f = chips.firstObject;
      this.transitionToRoute('home.chat', f['id'], 'one2one');
      this.set('messageToSend', this.get('messageText'));
      this.set('messageText', '')

    } else {
      this.set('messageToSend', this.get('messageText'));
      this.set('messageText', '')
      this.createGroup().then(() => {

      });
    }
  },
  performSendMessage() {

    if (!this.get('canPerformSend'))
      return;
    if (this.get('isCompose')) {
      if (this.get('composeChips').length === 0) {
        this.set('composeError', 'Add friends to group');
        setTimeout(() => {
          this.set('composeError', '');
        }, 2000);
      } else {

        this.composeMessage();
      }
      return;
    }
    let ds = this.get('dataSource');
    let reply = this.get('inReplyTo');
    let uploads = this.get('uploads');
    const message = (this.get('messageText')||'').replace(/(<([^>]+)>)/ig,"");
    ds.sendMessage(message,uploads, reply).then((newMessage)=>{
      this.handleSentMessage(newMessage);
    });

    this.resetUploads();
    this.set('inReplyTo', null);
    this.set('messageText', '');
  },
  handleSentMessage(newMessage){
    const local = JSON.parse(JSON.stringify(newMessage));
    local.isLocal = true;
    local.date = this.get('ntp').estimatedServerTimeMs();
    local.id = newMessage.uid;
    const localMessages = this.get('remoteMessages');
    const exists = localMessages.find((elem)=>{
      return get(elem,'uid') === get(newMessage,'uid');
    });
    if (exists){
      exists.isLocal = true;
    }else{
      localMessages.pushObject(local);
    }
    this.updateRemoteMessages(localMessages);
  },
  shareVideo(video,sendMessage = false) {
    let ds = this.get('dataSource');
    if (this.get('canSendVideo')) {
      let holder = $('#youtubePlaceHolder');
      let height = 9 * holder.width() / 16;
      holder.height(height);

      $('#youtubePlaceHolder').show();

      this.set('playerModel', video);
      ds.sendVideo(video)
    } else {
      ds.sendMessage('', [],null, {
        id: get(video,'id'),
        title: get(video,'title'),
        channelTitle: get(video,'description'),
        imageURL: get(video,'thumbnail'),
        videoType: get(video,'kind'),
        videoCategory: get(video,'category'),
        videoUrl: get(video,'url')
      }).then((newMessage)=>{
        this.handleSentMessage(newMessage);
      })
    }
  },
  canAutoplay: computed('playerVideo', 'videoStateHandler', function () {
    let vsh = this.get('videoStateHandler');
    if (!vsh)
      return false;
    let master = vsh.isMaster;
    let senderId = this.get('playerVideo.video.senderId');
    if (!senderId)
      return false;

    return (master || senderId === this.db.myId());
  }),
  closeFullScreen(){
    $('.messages-holder-full').show();
    this.set('playerAction', 1000);
    $('body').removeClass('fullscreen-video');
    $('.controlsOverlay').removeClass('fullscreen-video');
    this.set('videoPlayerState',1);
    this.set('isFullScreen',false);
  },
  actions: {
    onProviderChanged(){
      if (this.get('searchMode') === 'video') {

      } else {
        this.queryMusic(true);
      }
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

      // this.set('messageDateTimeout', setTimeout(()=>{
        // $('.message-scroll-date-holder').fadeOut('fast');
      // },1000));

    },

    selectEmoji(emoji){
      let msg = this.get('messageText');

      msg = msg + ' ' + emoji;
      this.set('messageText', msg);
    },
    onReplyTo(message){
      this.set('inReplyTo', message);
      setTimeout(()=>{
        $('.ember-content-editable.messageContent').focus();
      }, 1000);

    },
    clearInReplyTo(){
      this.set('inReplyTo', null);
    },
    loadMore() {
      this.set('blockAutoscroll', true);
      this.loadMoreMessages();
    },
    onVideoEnd() {
      if ($('#autoplay-checkbox')[0] && $('#autoplay-checkbox')[0].checked) {
        let vsh = this.get('videoStateHandler');
        let master = vsh.isMaster;
        let senderId = this.get('playerVideo.video.senderId');
        if (this.get('playerVideo.video.videoType') === 'youtube#video' && (master || senderId === this.db.myId())) {
          this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
            this.shareVideo(SearchVideoResult.create({data: video}));
          });
        } else {
          this.closeVideo();
        }
      } else {
        let ds = this.get('dataSource');
        if (ds) {
          if (this.get('playerVideo.video.videoType') === 'youtube#video'){
            this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
              ds.sendVideoEnd(SearchVideoResult.create({data: video}))
            });
          }


        }
        this.closeVideo();
      }
    },
    playerStateAction(state) {
      run(() => {
        this.set('playerState', state);
      });
    },
    scrolledHalfYoutubeVideo() {
      if (this.get('searchMode') === 'video') {
        this.set('loadingVideo', true);
        this.queryVideos(false).then(() => {
          this.set('loadingVideo', false);
        });
      }
    },
    scrolledHalfYoutubeMusic() {
      if (this.get('searchMode') === 'music') {
        this.set('loadingMusic', true);
        this.queryMusic(false).then(() => {
          this.set('loadingMusic', false);
        });
      }
    },
    videoLoaded() {
      let ds = this.get('videoStateHandler');
      ds.handleNextState('loaded');
    },
    uploadImage(file) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        }
        return;
      }
      this.uploadImageToChat(file);
    },
    sendMessage() {
      this.performSendMessage();
    },
    videoPick(video) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        } else {
          this.composeMessage();
        }
        return;
      }
      if (!this.get('playerVideo') && this.get('canSendVideo')){
        this.set('playerVideo',{});
      }
      this.videoDetails(video).then((details)=>{
        this.shareVideo(details, true);
      });

    },
    musicPick(video) {
      if (this.get('isCompose')) {
        if (this.get('composeChips').length === 0) {
          this.set('composeError', 'Add friends to group');
          setTimeout(() => {
            this.set('composeError', '');
          }, 2000);
        } else {
          this.composeMessage();
        }
        return;
      }
      this.set('playerModel', video);
      let ds = this.get('dataSource');
      ds.sendVideo(video, 'youtubeMusic')
    },
    pickVideosSearch() {
      if (this.get('searchMode') !== 'video') {
        this.set('searchMode', 'video');
      }
    },
    pickSongsSearch() {
      if (this.get('searchMode') !== 'music') {
        this.set('searchMode', 'music');
      }
    },
    triggerSearch() {
      if (this.get('searchMode') === 'video') {
        this.queryVideos(true);
      } else {
        this.queryMusic(true);
      }
    },
    onChipAdd(data) {
      let exists = this.get('composeChips').filter((elem) => {
        return elem['id'] === data['id'];
      });
      if (exists.length === 0) {
        this.get('composeChips').pushObject(data);
        this.notifyPropertyChange('composeChips');
      }
    },
    onChipClick() {
      let chips = this.get('composeChips');
      chips.removeObject(chips.lastObject);
      this.notifyPropertyChange('composeChips');
    },
    onMessageEnterPress() {
      this.performSendMessage();
    },
    onPhotoSelect(photo) {

    },
    onTextPaste(index, text) {
      let m = this.get('messageText');
      let output = [m.slice(0, index), text, m.slice(index)].join('');
      this.set("messageText", output);
    },
    onVideoRequestClick(video){
      this.shareVideo(video);
    },
    onMessageClick(message) {
      if (message.get('type') === 'VideoRequest') {
        if (this.get('isMaster')) {
          // this.get('youtubeSearch').video(message.get('video.id')).then((video) => {
          //
          // });
        }
      }
      if (message.get('type') === 'ShareVideo'){
        this.get('youtubeSearch').video(message.get('video.id')).then((video) => {
          this.shareVideo(video);
        });
      }
      if (message.get('type') === 'Video') {
        // this.set('videoPlayerUrl', message['media']);
        // $('#videoPreviewModal').modal();
      }
    },
    videoPlayerReady(player, component) {
      this.playerComponent = component;
      this.playerPlayer = player;
    },
    goBack(){
      const m = this.get('chatModel');
      const type = this.get('model.type');
      if (!m || type!=='feed')
        return this.transitionToRoute('home');
      return this.transitionToRoute('home.group.show',{group_id: m.feed.get('id')});
    },
    playlistVideoAdd(video){
      return this.dataSource.addPlaylistItem(video);
    },
    playlistVideoRemove(video){
      return this.dataSource.removePlaylistItem(video);
    },
    onScrollToMessage(uid){
      this.setLimitToMessageUID(uid);
    },
    videoPlayerFullWindow(){
      $('.controlsOverlay').addClass('fullscreen-video');
      $('body').addClass('fullscreen-video');
      this.set('videoPlayerState',1);
      $('.messages-holder-full').show();
      this.set('isFullScreen',true);
    },
    videoPlayerFullWindowOff(){
      this.closeFullScreen();
    },
    videoPlayerCollapse(){
      this.set('videoPlayerState',0);
    },
    videoPlayerExpand(){
      this.set('videoPlayerState',1);
    },
    onPlayerShow(){
      this.set('refreshScroll',new Date());
    },
    onPlayerUpdate(){
      if (window.globalPlayer && window.globalPlayer.isMuted){
        this.set('videoMute',window.globalPlayer.isMuted());
      }
      if (window.globalPlayer){
        this.set('playerReady', true);
      }
    },
    videoPlayerMute(){
      const muted = window.globalPlayer.isMuted()
      if (muted){
        window.globalPlayer.unMute();
      }else{
        window.globalPlayer.mute();
      }
      this.set('videoMute',!muted);
    },
    onToggleMic(){
      this.toggleProperty('streamingModel.mic');
      this.streamer.startStreaming(this.streamerHolderSelector(), this.localStreamId(),this.get('streamingModel'),this.get('db').myId());
    },
    onToggleCamera(){
      this.toggleProperty('streamingModel.video');
      this.streamer.startStreaming(
        this.streamerHolderSelector(), this.localStreamId(), this.get('streamingModel'),this.get('db').myId());
    }
  }
});
