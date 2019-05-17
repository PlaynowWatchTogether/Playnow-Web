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
import { get } from '@ember/object';
import MessagingUploadsHandler from '../../mixins/messaging-uploads-handler';
import MessagingMessageHelper from '../../mixins/messaging-message-helper';
import MessagingMessagePager from '../../mixins/messaging-messsage-pager';
import VideoSearchMixin from '../../mixins/videos-search-mixin';
import ChatModelHelper from '../../mixins/chat-model-helper';

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
    this.videoStateHandler = VideoStateHandler.create({
      ntp: this.get('ntp'),
      delegate: {
        loadVideo: (video, seconds) => {
          run(() => {
            const oldValue = this.get('hasPlayer');
            if (oldValue){
              this.set('hasPlayer', false);
              this.set('playerReady',false);
              this.set('playerAction', 0);
              this.set('playerVideo', null);
              setTimeout(()=>{
                this.set('hasPlayer', true);
                this.set('playerAction', 0);
                this.set('playerVideo', {video: video, seconds: seconds});
              },1000);
            }else{
              this.set('hasPlayer', true);
              this.set('playerAction', 0);
              this.set('playerVideo', {video: video, seconds: seconds});
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
    this.set('playerState', {});
    this.set('searchMode', 'video');

    this.queryVideos(true);
    this.queryMusic(true);
  },
  displayWatchers: computed('hasPlayer','playerReady', function(){
    const hasPlayer = this.get('hasPlayer');
    const ready = this.get('playerReady');
    return hasPlayer && ready;

  }),
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
        return 'active';
      if (!l.playing)
        return 'active'
    }
    return ''
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
  modelObserver: (obj) => {
    $(document).on('keyup.chat',(event)=>{
      if (27 === event.keyCode){
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
      obj.store.find('friends', convId).then((friend) => {
        obj.set('chatModel', {
          hasProfilePic: true,
          title: friend.get('displayName'),
          ProfilePic: friend.get('safeProfilePic'),
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
        obj.db.feed(convId).then((feed)=>{
          const isAdmin = feed.creatorId === myId;// || Object.keys(feed.Admins || {}).includes(myId());
          obj.set('chatModel', {
            hasProfilePic: true,
            title: 'Live @' + feed.GroupName,
            ProfilePic: feed.ProfilePic,
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


          obj.videoStateHandler.isMaster = isAdmin;
          obj.videoStateHandler.syncMode = obj.isTypePublicRoom(type) ? 'sliding' : 'awaiting';
        })
      }
    } else if ('group' === type) {
      obj.store.find('group', convId).then((group) => {
        obj.set('chatModel', {
          hasProfilePic:  profilePic!=null && profilePic.length > 0,
          ProfilePic: profilePic,
          title: group.get('GroupName'),
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
        let profilePic = group.get('ProfilePic');


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
      });

    } else {
      obj.set('chatModel', {});
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
        Promise.all(allWatcherProfiles).then((profiles) => {
          obj.set('allWatchers', profiles);
        })
      }
    });
    ds.videoState((vs) => {
      if (vs) {
        run(() => {
          obj.videoStateHandler.handleVideoState(vs);
        });
      }
    });
    ds.lastMessageSeen((lastSeen) => {
      if (ds.type === 'one2one') {
        obj.set('lastSeenMessage', lastSeen);
      }
    });
    ds.members((members) => {
      obj.set('members', members);
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

    ds.messages((messages) => {
      const converted = obj.convertServerMessagesToUI(messages,obj.messageConvId());
      const wrappedMessages = converted.messages;
      const lastRecord = converted.lastRecord;
      const uiMessages = [];
      if (lastRecord){
        ds.sendSeen(lastRecord.uid);
      }
      const type = obj.get('model.type');
      wrappedMessages.forEach((mesCntent)=>{

        let normalizedData = obj.store.normalize('thread-message', {
          id: mesCntent.id,
          convoId: mesCntent.convId,
          isMessage: mesCntent.isMessage,
          isDate: mesCntent.isDate,
          content: JSON.stringify(mesCntent)
        });

        obj.store.push(normalizedData);

        uiMessages.push(MessageObject.create({
          content: mesCntent
        }));
      })
      obj.set('blockAutoscroll', false);
      obj.set('isLoadingMessages', false);
      obj.updateMessages(uiMessages);

      // obj.notifyPropertyChange('messages');
      // obj.set('messages', uiMessages);
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
  displayVideoRequest: computed('isMaster', function(){
    return !this.get('isMaster');
  }),
  isMaster: computed('dataSource', function () {
    let ds = this.get('dataSource');
    let type = this.get('model').type;
    if (ds) {
      if (type==='feed'){
        const isAdmin =this.get('chatModel.isAdmin');
        return isAdmin;
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
      if (this.get('model.type') === 'feed'){
        title = `${get(chat,'feed.GroupName')}'s playlist`;
      }
      return {title:title, videos: Object.values(playlist || {})}
    }else{
      return null;
    }
  }),
  reset() {
    this.set('playerReady',false);
    this.closeFullScreen();
    $(document).off("keyup.chat");
    this.set('displayEmoji',false);
    this.offGroupListen();
    this.set('inReplyTo', null);
    this.set('id', null);
    this.resetUploads();
    this.resetVideoSearch();
    this.set('messageText', '');
    this.set('playerVideo', {});
    this.set('composeChips', []);
    this.set('chatModel', {});

    this.set('searchMode', 'video');
    this.set('isLoadingMessages', false);
    this.queryVideos(true);
    this.queryMusic(true);

    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.removeWatching();
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
  closeVideo() {
    this.closeFullScreen();
    let vsh = this.get('videoStateHandler');
    this.set('hasPlayer', false);
    vsh.closeVideo();
    this.set('playerVideo', {});
    let ds = this.get('dataSource');
    if (ds) {
      this.set('playerAction', 10);
      ds.updateWatching('', 'closed');
    }
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
    ds.sendMessage(this.get('messageText'),uploads, reply);
    this.resetUploads();
    this.set('inReplyTo', null);
    this.set('messageText', '');
  },
  shareVideo(video,sendMessage = false) {
    let ds = this.get('dataSource');
    if (this.get('isMaster')) {
      this.set('playerModel', video);
      ds.sendVideo(video)
    } else {
      ds.sendMessage('', [],null, {
        id: video['id'],
        title: video['snippet']['title'],
        channelTitle: video['snippet']['channelTitle'],
        imageURL: video['snippet']['thumbnails']['high']['url'],
        isMusic: video['categoryId'] === '10',
        videoType: video['categoryId'] === '10' ? 'youtubeMusic' : 'youtubeVideo'
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
        if (this.get('playerVideo.video.videoType') === 'youtubeVideo' && (master || senderId === this.db.myId())) {
          this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
            this.shareVideo(video);
          });
        } else {
          this.closeVideo();
        }
      } else {
        let ds = this.get('dataSource');
        if (ds) {
          this.youtubeSearch.related(this.get('playerVideo.video.videoId')).then((video) => {
            ds.sendVideoEnd(video)
          });


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
    onMessageClick(message) {
      if (message['type'] === 'VideoRequest') {
        if (this.get('isMaster')) {
          this.get('youtubeSearch').video(message['video']['id']).then((video) => {
            this.shareVideo(video);
          });
        }
      }
      if (message['type'] === 'ShareVideo'){
        this.get('youtubeSearch').video(message.video.id).then((video) => {
          this.shareVideo(video);
        });
      }
      if (message['type'] === 'Video') {
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
      return this.transitionToRoute('home.group.show',{group_id: m.feed.id});
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
    }
  }
});
